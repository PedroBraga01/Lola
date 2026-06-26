import { useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import './Chat.css';

const SUGGESTIONS = [
  'O que tenho na agenda hoje?',
  'Criar tarefa: revisar relatório 30/06',
  'Quais são minhas tarefas pendentes?',
  'Agendar reunião amanhã às 14h',
];

export default function ChatContainer({ messages, isLoading, onSend, onSuggestionClick, onClearChat }) {
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const isEmpty = messages.length === 0;

  return (
    <div className="chat-container" id="chat-container">
      {isEmpty ? (
        /* Empty state */
        <div className="chat-empty">
          <div className="chat-empty-logo">🐕</div>
          <h2 className="chat-empty-title">
            Como posso ajudar você hoje?
          </h2>
        </div>
      ) : (
        /* Messages */
        <div className="chat-messages" ref={messagesContainerRef} style={{ position: 'relative' }}>
          <div style={{ position: 'sticky', top: '10px', textAlign: 'center', zIndex: 10, marginBottom: '20px' }}>
            <button onClick={onClearChat} className="chat-suggestion" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', background: 'var(--surface-hover)', border: '1px solid var(--border)', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
              ✨ Reiniciar conversa
            </button>
          </div>
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}

          {/* Typing indicator */}
          {isLoading && (
            <div className="chat-typing">
              <div className="chat-typing-avatar">🐕</div>
              <div className="chat-typing-dots">
                <span className="chat-typing-dot" />
                <span className="chat-typing-dot" />
                <span className="chat-typing-dot" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      )}

      <ChatInput onSend={onSend} isLoading={isLoading} />
    </div>
  );
}
