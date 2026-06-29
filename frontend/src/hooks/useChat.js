import { useState, useCallback, useRef } from 'react';
import api from '../services/api';

const STORAGE_KEY = 'lola_chat_history';

function loadHistory() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveHistory(messages) {
  try {
    // Keep only last 100 messages to avoid storage issues
    const toSave = messages.slice(-100);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch (err) {
    console.warn('Não foi possível salvar o histórico:', err);
  }
}

export function useChat() {
  const [messages, setMessages] = useState(() => loadHistory());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  const sendMessage = useCallback(async (text) => {
    if (!text.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => {
      const updated = [...prev, userMessage];
      saveHistory(updated);
      return updated;
    });

    setIsLoading(true);
    setError(null);

    try {
      // Build history for Gemini context (last 20 messages)
      const recentMessages = [...messages, userMessage].slice(-20);
      const history = recentMessages.map((m) => ({
        role: m.role === 'user' ? 'user' : 'model',
        content: m.content,
      }));

      const response = await api.sendMessage(text.trim(), history);

      // Extract actions from function calls
      const actions = [];
      if (response.functionCall && response.functionCall.name !== 'general_response') {
        const type = response.functionCall.name === 'create_calendar_event' ? 'event_created'
          : response.functionCall.name === 'create_task' ? 'task_created'
          : response.functionCall.name === 'complete_task' ? 'task_completed'
          : response.functionCall.name === 'list_events' ? 'events_listed'
          : response.functionCall.name === 'list_tasks' ? 'tasks_listed'
          : response.functionCall.name === 'create_alarm' ? 'alarm_created'
          : 'action';
          
        actions.push({
          type,
          title: response.functionCall.args?.summary || response.functionCall.args?.title || response.functionCall.args?.label || response.functionCall.name,
          detail: response.functionCall.args?.startDateTime || response.functionCall.args?.dueDate || response.functionCall.args?.time || '',
          data: response.functionCall.args // guarda todos os args pra usar no botão
        });
      }

      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.response || response.reply || 'Sem resposta.',
        actions,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => {
        const updated = [...prev, assistantMessage];
        saveHistory(updated);
        return updated;
      });
    } catch (err) {
      setError(err.message || 'Erro ao enviar mensagem');
      // Add error message from assistant
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente em instantes.',
        isError: true,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => {
        const updated = [...prev, errorMessage];
        saveHistory(updated);
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading]);

  const clearHistory = useCallback(() => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearHistory,
  };
}

export default useChat;
