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
              const isAlarmProposal = action.type === 'alarm_proposal';

              const handleApproveAlarm = async () => {
                if (window.LolaAndroid && window.LolaAndroid.criarAlarme) {
                  const alarms = action.data?.alarms || [];
                  if (alarms.length === 0) return;
                  
                  const daysMap = {
                    'sunday': 1, 'monday': 2, 'tuesday': 3, 'wednesday': 4,
                    'thursday': 5, 'friday': 6, 'saturday': 7,
                    'domingo': 1, 'segunda': 2, 'terça': 3, 'quarta': 4,
                    'quinta': 5, 'sexta': 6, 'sábado': 7, 'sabado': 7
                  };

                  const btn = document.getElementById(`btn-approve-${message.id}`);
                  if (btn) {
                    btn.innerText = "Criando...";
                    btn.disabled = true;
                  }

                  for (let j = 0; j < alarms.length; j++) {
                    const alarm = alarms[j];
                    const time = alarm.horario;
                    if (!time) continue;
                    
                    const [hour, min] = time.split(':');
                    
                    let diasCsv = "";
                    if (alarm.ciclo === 'rotina' && alarm.diasSemana) {
                      const daysStr = Array.isArray(alarm.diasSemana) ? alarm.diasSemana.join(',') : alarm.diasSemana;
                      // Tenta mapear os dias para os números usados pelo Android
                      const foundDays = [];
                      const lower = daysStr.toLowerCase();
                      if (lower.includes('domingo')) foundDays.push(1);
                      if (lower.includes('segunda')) foundDays.push(2);
                      if (lower.includes('terça') || lower.includes('terca')) foundDays.push(3);
                      if (lower.includes('quarta')) foundDays.push(4);
                      if (lower.includes('quinta')) foundDays.push(5);
                      if (lower.includes('sexta')) foundDays.push(6);
                      if (lower.includes('sábado') || lower.includes('sabado')) foundDays.push(7);
                      
                      diasCsv = foundDays.length > 0 ? foundDays.join(',') : "";
                    }
                    
                    window.LolaAndroid.criarAlarme(
                      parseInt(hour, 10), 
                      parseInt(min, 10), 
                      alarm.titulo || 'Alarme da Lola', 
                      diasCsv
                    );
                    
                    // Delay para evitar colisão de Intents no Android
                    await new Promise(r => setTimeout(r, 600));
                  }
                  
                  if (btn) {
                    btn.innerText = "✓ Confirmado";
                    btn.style.background = "#2e7d32";
                  }
                } else {
                  alert('O aplicativo Android não foi detectado. Rodando na web?');
                }
              };

              if (isAlarmProposal) {
                const alarms = action.data?.alarms || [];
                return (
                  <div key={i} className="chat-action-card" style={{flexDirection: 'column', alignItems: 'stretch'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px'}}>
                      <span className="chat-action-icon">⏰</span>
                      <span className="chat-action-text"><strong>Alarmes propostos:</strong></span>
                    </div>
                    <div style={{fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '12px'}}>
                      {alarms.map((al, idx) => (
                        <div key={idx} style={{marginBottom: '8px', padding: '6px', background: 'rgba(0,0,0,0.1)', borderRadius: '4px'}}>
                          <div><strong>{idx + 1}. Título:</strong> {al.titulo} ({al.horario})</div>
                          <div><strong>Frequência:</strong> {al.ciclo}</div>
                          <div><strong>Tipo:</strong> {al.tipo}</div>
                        </div>
                      ))}
                    </div>
                    <button 
                      id={`btn-approve-${message.id}`}
                      className="btn btn-primary" 
                      style={{padding: '6px 12px', fontSize: '0.85rem', width: '100%'}}
                      onClick={handleApproveAlarm}
                    >
                      Confirmar
                    </button>
                  </div>
                );
              }

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
