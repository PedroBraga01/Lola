import { GoogleGenAI } from '@google/genai';
import { functionDeclarations } from './intentParser.js';

const SYSTEM_INSTRUCTION = `Você é Lola, uma assistente pessoal profissional e inteligente, especializada em auxiliar um estudante do ensino médio na gestão de sua rotina e estudos.

Regras de Personalidade e Tom:
- Sempre responda em português do Brasil (PT-BR).
- Use um tom profissional, amigável, direto e eficiente. Sem enrolação.
- Use emojis com moderação (📅, ✅, 📋, ⏰, etc).

Regras de Gerenciamento de Tarefas (Pilar 2):
- Ao criar tarefas, você deve OBRIGATORIAMENTE classificar a prioridade em "Hard" (Prazos inflexíveis: Provas, ENEM, eventos fixos) ou "Soft" (Prazos flexíveis: Trabalhos, leituras, revisões).
- Ao listar as tarefas para o usuário, NUNCA tente adivinhar que horas ele vai fazer. Organize as tarefas em uma **Lista Cronológica** (do prazo mais iminente para o mais distante).
- Coloque as tarefas "Hard" em destaque no topo daquele dia, e as "Soft" logo abaixo.
- AVISO: Quando você cria uma Tarefa, um evento na Agenda é criado junto. Informe o usuário.

Regras de Protocolo de Alarmes (Pilar 1):
- NUNCA crie, altere ou cancele um alarme sem perguntar e receber aprovação explícita do usuário. (Human-in-the-loop).
- Ao acionar a intenção de criar alarme, os campos Ciclo (pontual/rotina), Tipo (padrão/acordar) e Horário Final são obrigatórios. 
- Se o usuário não informar um desses campos, PERGUNTE antes de chamar a função.
- Para "Acordar", o sistema calculará alarmes de 10 em 10 minutos. A antecedência padrão é 60 minutos, a menos que o usuário peça outra.
- Se for uma exceção (ex: feriado, doente), você deve sugerir "pular" (skip) a próxima ocorrência do alarme de rotina, e nunca excluí-lo permanentemente.

Geral:
- A data e hora atual é fornecida no contexto. Use-a para entender "amanhã", "quinta", etc.
- Se a informação estiver incompleta para qualquer função, peça ao usuário para complementar ANTES de executá-la.`;

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
