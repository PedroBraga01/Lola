import { formatTime } from './chatUtils';

export default function ChatMessage({ message }) {
  const isUser = message.role === 'user';
  const isError = message.isError;

  return (
    <div
      className={`chat-message chat-message--${message.role} ${isError ? 'chat-message--error' : ''}`}
      id={`msg-${message.id}`}
    >
      <div className="chat-message-avatar">
        {isUser ? '👤' : '🐕'}
      </div>

      <div className="chat-message-body">
        <div className="chat-message-bubble">
          {renderContent(message.content)}
        </div>

        {/* Action cards */}
        {message.actions && message.actions.length > 0 && (
          <div className="chat-actions">
            {message.actions.map((action, i) => {
              const isAlarm = action.type === 'alarm_created';

              const handleApproveAlarm = () => {
                if (window.LolaAndroid && window.LolaAndroid.criarAlarme) {
                  const { time, label, cycle, days } = action.data || {};
                  if (!time) return;
                  
                  const [hour, min] = time.split(':');
                  // Converter array de dias para CSV. Ex: ["Monday", "Tuesday"] para "2,3"
                  const daysMap = {
                    'Sunday': 1, 'Monday': 2, 'Tuesday': 3, 'Wednesday': 4,
                    'Thursday': 5, 'Friday': 6, 'Saturday': 7
                  };
                  let diasCsv = "";
                  if (cycle === 'rotina' && Array.isArray(days)) {
                    diasCsv = days.map(d => daysMap[d]).filter(Boolean).join(',');
                  }
                  
                  window.LolaAndroid.criarAlarme(
                    parseInt(hour, 10), 
                    parseInt(min, 10), 
                    label || 'Alarme da Lola', 
                    diasCsv
                  );
                  alert('Alarme enviado para o Android!');
                } else {
                  alert('O aplicativo Android não foi detectado (LolaAndroid interface não existe). Você está rodando na web?');
                }
              };

              return (
                <div key={i} className="chat-action-card">
                  <div style={{display: 'flex', alignItems: 'center', gap: '8px', flex: 1}}>
                    <span className="chat-action-icon">
                      {getActionIcon(action.type)}
                    </span>
                    <span className="chat-action-text">
                      <strong>{action.title}</strong>
                      {action.detail && ` — ${action.detail}`}
                    </span>
                  </div>
                  {isAlarm && (
                    <button 
                      className="btn btn-primary" 
                      style={{padding: '4px 12px', fontSize: '0.75rem', marginTop: '8px', width: '100%'}}
                      onClick={handleApproveAlarm}
                    >
                      Aprovar no Android
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <span className="chat-message-time">
          {formatTime(message.timestamp)}
        </span>
      </div>
    </div>
  );
}

function renderContent(content) {
  if (!content) return null;
  
  // Simple markdown-like rendering
  const lines = content.split('\n');
  const elements = [];
  let currentList = [];
  let listType = null;

  const processInline = (text) => {
    // Bold
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Inline code
    text = text.replace(/`(.*?)`/g, '<code>$1</code>');
    return text;
  };

  lines.forEach((line, i) => {
    const trimmed = line.trim();
    
    // Unordered list
    if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
      if (listType !== 'ul') {
        if (currentList.length > 0) {
          elements.push(
            <ul key={`list-${i}`}>
              {currentList.map((item, j) => (
                <li key={j} dangerouslySetInnerHTML={{ __html: processInline(item) }} />
              ))}
            </ul>
          );
          currentList = [];
        }
        listType = 'ul';
      }
      currentList.push(trimmed.slice(2));
    } else if (/^\d+\.\s/.test(trimmed)) {
      // Ordered list
      if (listType !== 'ol') {
        if (currentList.length > 0) {
          const Tag = listType === 'ol' ? 'ol' : 'ul';
          elements.push(
            <Tag key={`list-${i}`}>
              {currentList.map((item, j) => (
                <li key={j} dangerouslySetInnerHTML={{ __html: processInline(item) }} />
              ))}
            </Tag>
          );
          currentList = [];
        }
        listType = 'ol';
      }
      currentList.push(trimmed.replace(/^\d+\.\s/, ''));
    } else {
      // Flush any pending list
      if (currentList.length > 0) {
        const Tag = listType === 'ol' ? 'ol' : 'ul';
        elements.push(
          <Tag key={`list-${i}`}>
            {currentList.map((item, j) => (
              <li key={j} dangerouslySetInnerHTML={{ __html: processInline(item) }} />
            ))}
          </Tag>
        );
        currentList = [];
        listType = null;
      }

      if (trimmed === '') {
        // Skip empty lines
      } else {
        elements.push(
          <p key={`p-${i}`} dangerouslySetInnerHTML={{ __html: processInline(trimmed) }} />
        );
      }
    }
  });

  // Flush remaining list
  if (currentList.length > 0) {
    const Tag = listType === 'ol' ? 'ol' : 'ul';
    elements.push(
      <Tag key="list-end">
        {currentList.map((item, j) => (
          <li key={j} dangerouslySetInnerHTML={{ __html: processInline(item) }} />
        ))}
      </Tag>
    );
  }

  return elements.length > 0 ? elements : <p>{content}</p>;
}

function getActionIcon(type) {
  switch (type) {
    case 'event_created': return '📅';
    case 'task_created': return '✅';
    case 'task_completed': return '🎉';
    case 'events_listed': return '📋';
    case 'tasks_listed': return '📝';
    case 'alarm_created': return '⏰';
    default: return '⚡';
  }
}
