import { GoogleGenAI } from '@google/genai';
import { functionDeclarations } from './intentParser.js';

const SYSTEM_INSTRUCTION = `Você é Lola, uma assistente pessoal profissional. Você ajuda o usuário a gerenciar sua agenda, tarefas e compromissos.

Regras:
- Sempre responda em português do Brasil (PT-BR).
- Use um tom profissional, amigável e eficiente.
- Quando o usuário pedir para criar eventos ou tarefas, extraia todas as informações necessárias (título, data, horário, descrição).
- Se a informação estiver incompleta, peça ao usuário para complementar ANTES de criar o evento/tarefa.
- A data e hora atual é fornecida no contexto da conversa. Use-a como referência para interpretar datas relativas como "amanhã", "próxima segunda", "semana que vem".
- Ao listar eventos ou tarefas, formate as informações de forma clara e organizada.
- Você NÃO é uma IA genérica. Seu foco é gerenciamento pessoal: agenda, tarefas, compromissos e lembretes.
- Para perguntas fora do seu escopo, responda educadamente que você é especializada em gerenciamento pessoal.
- Quando criar algo com sucesso, confirme com detalhes (nome, data, horário).
- Use emojis com moderação para tornar as respostas mais visuais (📅, ✅, 📋, ⏰, etc).
- IMPORTANTE: Ao usar funções, preencha TODOS os campos obrigatórios. Nunca chame uma função sem os parâmetros necessários.
- Para eventos sem horário final especificado, assuma duração de 1 hora.
- Para eventos de dia inteiro, use isAllDay: true.
- AVISO: Quando você cria uma Tarefa que possui data, o sistema AUTOMATICAMENTE cria um evento na Agenda do usuário para esse mesmo dia. Por favor, sempre informe o usuário que a tarefa E O EVENTO NA AGENDA foram criados juntos.`;

let ai = null;

function getAI() {
  if (!ai) {
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return ai;
}

/**
 * Sends a message to Gemini with function calling enabled.
 * Returns the model's response, which may include function calls.
 *
 * @param {string} userMessage - The user's message
 * @param {Array} chatHistory - Previous conversation messages in Gemini format
 * @returns {object} - { functionCall: {...} | null, textResponse: string | null }
 */
export async function sendMessage(userMessage, chatHistory = []) {
  const genai = getAI();

  // Build the current date context
  const now = new Date();
  const dateContext = `[Contexto: Data e hora atual: ${now.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}. Dia da semana: ${now.toLocaleDateString('pt-BR', { weekday: 'long', timeZone: 'America/Sao_Paulo' })}]`;

  const fullMessage = `${dateContext}\n\n${userMessage}`;

  // Build contents array from history + new message
  const contents = [
    ...chatHistory,
    { role: 'user', parts: [{ text: fullMessage }] },
  ];

  const response = await genai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      tools: [{ functionDeclarations }],
    },
  });

  // Check if the model wants to call a function
  const parts = response.candidates?.[0]?.content?.parts || [];

  for (const part of parts) {
    if (part.functionCall) {
      return {
        functionCall: {
          name: part.functionCall.name,
          args: part.functionCall.args || {},
        },
        textResponse: null,
      };
    }
  }

  // No function call — return the text response
  const text = response.text || '';
  return {
    functionCall: null,
    textResponse: text,
  };
}

/**
 * Sends a function result back to Gemini so it can formulate a confirmation response.
 *
 * @param {string} functionName - The name of the function that was called
 * @param {object} functionResult - The result from executing the function
 * @param {Array} chatHistory - The conversation history
 * @param {string} userMessage - The original user message
 * @returns {string} - Gemini's text response
 */
export async function sendFunctionResult(functionName, functionResult, chatHistory = [], userMessage = '') {
  const genai = getAI();

  const now = new Date();
  const dateContext = `[Contexto: Data e hora atual: ${now.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}. Dia da semana: ${now.toLocaleDateString('pt-BR', { weekday: 'long', timeZone: 'America/Sao_Paulo' })}]`;

  // Build full content sequence: history → user message → model function call → function response
  const contents = [
    ...chatHistory,
    {
      role: 'user',
      parts: [{ text: `${dateContext}\n\n${userMessage}` }],
    },
    {
      role: 'model',
      parts: [{
        functionCall: {
          name: functionName,
          args: {},
        },
      }],
    },
    {
      role: 'user',
      parts: [{
        functionResponse: {
          name: functionName,
          response: { result: functionResult },
        },
      }],
    },
  ];

  const response = await genai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      tools: [{ functionDeclarations }],
    },
  });

  return response.text || 'Ação concluída.';
}
