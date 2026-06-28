import { formatTime } from './chatUtils';

function parseDays(diasStr) {
  if (!diasStr) return [];
  const map = {
    'domingo': 1, 'segunda': 2, 'terça': 3, 'quarta': 4, 'quinta': 5, 'sexta': 6, 'sábado': 7,
    'terca': 3, 'sabado': 7
  };
  const str = diasStr.toLowerCase();
  if (str.includes('segunda a sexta')) return [2,3,4,5,6];
  if (str.includes('todos os dias')) return [1,2,3,4,5,6,7];
  if (str.includes('final de semana')) return [1,7];
  
  const result = [];
  for (const [name, val] of Object.entries(map)) {
    if (str.includes(name)) {
      if (!result.includes(val)) result.push(val);
    }
  }
  return result;
}

export default function ChatMessage({ message }) {
  const isUser = message.role === 'user';
  const isError = message.isError;

  const handleApproveAlarm = (action) => {
    if (window.AndroidLolaInterface) {
      const args = action.args || {};
      const parts = (args.horario || "07:00").split(":");
      const hour = parseInt(parts[0], 10);
      const minute = parseInt(parts[1], 10);
      const label = args.tipo === 'acordar' ? 'Acordar (Lola)' : 'Alarme Lola';
      
      let daysJson = "[]";
      if (args.ciclo === 'rotina') {
        const days = parseDays(args.diasSemana);
        daysJson = JSON.stringify(days);
      }

      window.AndroidLolaInterface.createAlarm(hour, minute, daysJson, label);
    } else {
      alert("Recurso disponível apenas no App Android da Lola.");
    }
  };

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
            {message.actions.map((action, i) => (
              <div key={i} className="chat-action-card">
                <span className="chat-action-icon">
                  {getActionIcon(action.type)}
                </span>
                <span className="chat-action-text">
                  <strong>{action.title}</strong>
                  {action.detail && ` — ${action.detail}`}
                </span>
                {action.type === 'alarm_pending' && (
                  <button className="btn btn-primary" onClick={() => handleApproveAlarm(action)} style={{marginLeft: 'auto', padding: '4px 12px', fontSize: '12px'}}>
                    Aprovar
                  </button>
                )}
              </div>
            ))}
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
    default: return '⚡';
  }
}
