import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { sendMessage, sendFunctionResult } from '../services/gemini.js';
import { createEvent, listEvents } from '../services/calendar.js';
import { createTask, listTasks, completeTask } from '../services/tasks.js';

const router = Router();

/**
 * Executes a function call from Gemini against the appropriate Google API.
 */
async function executeFunctionCall(oauth2Client, functionCall) {
  const { name, args } = functionCall;

  switch (name) {
    case 'create_calendar_event':
      return await createEvent(oauth2Client, args);

    case 'create_task':
      return await createTask(oauth2Client, args);

    case 'list_events':
      return await listEvents(oauth2Client, args);

    case 'list_tasks':
      return await listTasks(oauth2Client);

    case 'complete_task':
      return await completeTask(oauth2Client, args);

    case 'propose_alarms':
      // Frontend intercepta esta ação e desenha o card
      return { 
        status: 'pending_user_approval', 
        message: 'Lola montou a lista de alarmes. Por favor, confirme no card abaixo.',
        alarms: args.alarms || [] 
      };

    case 'general_response':
      // No API call needed — return the message directly
      return { message: args.message };

    default:
      throw new Error(`Função desconhecida: ${name}`);
  }
}

/**
 * POST /api/chat/message
 * Receives a user message and chat history, processes it through Gemini,
 * executes any function calls, and returns the final response.
 *
 * Body: { message: string, history: Array }
 */
router.post('/message', requireAuth, async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: 'Mensagem é obrigatória.' });
    }

    // Convert frontend history format to Gemini format
    // Frontend sends: { role: 'user'|'model', content: string }
    // Gemini expects: { role: 'user'|'model', parts: [{ text: string }] }
    const geminiHistory = (history || [])
      .filter(h => h && h.content && h.role)
      .map(h => ({
        role: h.role === 'assistant' || h.role === 'model' ? 'model' : 'user',
        parts: [{ text: h.content }],
      }));

    // Step 1: Send user message to Gemini
    const geminiResponse = await sendMessage(message.trim(), geminiHistory);

    // Step 2: If Gemini wants to call a function, execute it
    if (geminiResponse.functionCall) {
      const { name, args } = geminiResponse.functionCall;

      // For general_response, just return the message directly
      if (name === 'general_response') {
        return res.json({
          response: args.message,
          functionCall: { name, args },
          functionResult: null,
        });
      }

      try {
        // Execute the function against Google APIs
        const functionResult = await executeFunctionCall(req.oauth2Client, geminiResponse.functionCall);

        // Step 3: Send the function result back to Gemini for a nice confirmation message
        let confirmationText = '';
        if (name === 'propose_alarms') {
          confirmationText = 'Aqui estão os alarmes propostos para sua avaliação:';
        } else {
          confirmationText = await sendFunctionResult(name, functionResult, geminiHistory, message.trim());
        }

        return res.json({
          response: confirmationText,
          functionCall: { name, args },
          functionResult,
        });
      } catch (apiError) {
        console.error(`Erro ao executar função ${name}:`, apiError.message);

        // Send the error back to Gemini so it can inform the user
        let errorText = 'Desculpe, ocorreu um erro técnico ao processar sua solicitação.';
        try {
          const errorResult = { error: true, message: apiError.message };
          errorText = await sendFunctionResult(name, errorResult, geminiHistory, message.trim());
        } catch (fallbackError) {
          console.error('Erro no fallback do Gemini:', fallbackError.message);
        }

        return res.json({
          response: errorText,
          functionCall: { name, args },
          functionResult: null,
          error: true,
        });
      }
    }

    // Step 2b: No function call — return the text response directly
    return res.json({
      response: geminiResponse.textResponse,
      functionCall: null,
      functionResult: null,
    });
  } catch (err) {
    console.error('Erro no chat:', err);
    
    let userFriendlyError = 'Erro ao processar a mensagem. Tente novamente.';
    
    if (err.message && err.message.toLowerCase().includes('too many requests')) {
      userFriendlyError = 'Você enviou muitas mensagens rápido demais. A Lola precisa de um minutinho para respirar!';
    } else if (err.message && err.message.toLowerCase().includes('safety')) {
      userFriendlyError = 'A mensagem foi bloqueada pelo filtro de segurança da IA. Tente reescrever de outra forma.';
    }

    res.status(500).json({
      error: userFriendlyError,
    });
  }
});

export default router;
