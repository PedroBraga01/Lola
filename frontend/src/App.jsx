import { Routes, Route, Navigate } from 'react-router-dom';
import useAuth from './hooks/useAuth';
import useChat from './hooks/useChat';
import LoginPage from './components/Auth/LoginPage';
import AppLayout from './components/Layout/AppLayout';
import ChatContainer from './components/Chat/ChatContainer';
import Dashboard from './components/Dashboard/Dashboard';
import Settings from './components/Settings/Settings';
import api from './services/api';

export default function App() {
  const { user, loading, login, logout } = useAuth();
  const { messages, isLoading, sendMessage, clearHistory } = useChat();

  // Loading state
  if (loading) {
    return (
      <div className="app-loading">
        <div className="app-loading-logo">🐕</div>
        <p className="app-loading-text">Carregando...</p>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return <LoginPage onLogin={() => api.getAuthUrl()} />;
  }

  return (
    <Routes>
      <Route
        element={
          <AppLayout user={user} onLogout={logout} onClearChat={clearHistory} />
        }
      >
        <Route
          index
          element={
            <ChatContainer
              messages={messages}
              isLoading={isLoading}
              onSend={sendMessage}
              onSuggestionClick={sendMessage}
              onClearChat={clearHistory}
            />
          }
        />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
