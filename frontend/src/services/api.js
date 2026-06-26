/**
 * API service for communicating with the Lola backend.
 */

const API_BASE = import.meta.env.VITE_API_URL || '';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(url, config);

  if (response.status === 401) {
    throw new Error('Não autenticado');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erro desconhecido' }));
    throw new Error(error.message || `Erro ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Auth
  getAuthUrl: () => `${API_BASE}/api/auth/google`,
  getMe: () => request('/api/auth/me'),
  logout: () => request('/api/auth/logout', { method: 'POST' }),

  // Chat
  sendMessage: (message, history = []) =>
    request('/api/chat/message', {
      method: 'POST',
      body: JSON.stringify({ message, history }),
    }),

  // Calendar
  getEvents: (startDate, endDate) =>
    request(`/api/calendar/events?start=${startDate}&end=${endDate}`),
  createEvent: (eventData) =>
    request('/api/calendar/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    }),
  deleteEvent: (eventId) =>
    request(`/api/calendar/events/${eventId}`, { method: 'DELETE' }),

  // Tasks
  getTasks: () => request('/api/tasks'),
  createTask: (taskData) =>
    request('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    }),
  updateTask: (taskId, updates) =>
    request(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),
  deleteTask: (taskId) =>
    request(`/api/tasks/${taskId}`, { method: 'DELETE' }),
};

export default api;
