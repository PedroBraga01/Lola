import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import './Tasks.css';

export default function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getTasks();
      setTasks(data.tasks || []);
    } catch (err) {
      console.error('Erro ao carregar tarefas:', err);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleComplete = async (taskId) => {
    try {
      await api.updateTask(taskId, { status: 'completed' });
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId ? { ...t, status: 'completed' } : t
        )
      );
    } catch (err) {
      console.error('Erro ao completar tarefa:', err);
    }
  };

  const getDueDateStatus = (dueDate) => {
    if (!dueDate) return 'normal';
    const now = new Date();
    const due = new Date(dueDate);
    const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'overdue';
    if (diffDays <= 2) return 'soon';
    return 'normal';
  };

  const formatDueDate = (dueDate) => {
    if (!dueDate) return null;
    const date = new Date(dueDate);
    const now = new Date();
    const diffDays = Math.ceil((date - now) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return `Atrasada (${date.toLocaleDateString('pt-BR')})`;
    if (diffDays === 0) return 'Hoje';
    if (diffDays === 1) return 'Amanhã';
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const pendingTasks = tasks.filter((t) => t.status !== 'completed');
  const completedTasks = tasks.filter((t) => t.status === 'completed');

  return (
    <div className="tasks-view" id="tasks-view">
      <div className="tasks-header">
        <h1 className="tasks-title">Tarefas</h1>
        {pendingTasks.length > 0 && (
          <span className="tasks-count">
            {pendingTasks.length} pendente{pendingTasks.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      <div className="tasks-list">
        {loading ? (
          <>
            <div className="tasks-skeleton" />
            <div className="tasks-skeleton" style={{ width: '85%' }} />
            <div className="tasks-skeleton" style={{ width: '70%' }} />
          </>
        ) : pendingTasks.length === 0 && completedTasks.length === 0 ? (
          <div className="tasks-empty">
            <span className="tasks-empty-icon">✅</span>
            <p className="tasks-empty-text">
              Nenhuma tarefa encontrada.
              <br />
              <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
                Peça à Lola para criar uma tarefa no chat!
              </span>
            </p>
          </div>
        ) : (
          <>
            {/* Pending tasks */}
            {pendingTasks.map((task) => (
              <div key={task.id} className="task-card" id={`task-${task.id}`}>
                <div
                  className="task-checkbox"
                  onClick={() => handleComplete(task.id)}
                  role="checkbox"
                  aria-checked="false"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleComplete(task.id)}
                />
                <div className="task-info">
                  <div className="task-title">{task.title}</div>
                  {task.notes && <div className="task-notes">{task.notes}</div>}
                  {task.due && (
                    <span className={`task-due ${getDueDateStatus(task.due)}`}>
                      📅 {formatDueDate(task.due)}
                    </span>
                  )}
                </div>
              </div>
            ))}

            {/* Completed tasks */}
            {completedTasks.length > 0 && (
              <>
                <div style={{ 
                  padding: 'var(--space-3) 0',
                  color: 'var(--color-text-muted)',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 500
                }}>
                  Concluídas ({completedTasks.length})
                </div>
                {completedTasks.slice(0, 5).map((task) => (
                  <div key={task.id} className="task-card completed">
                    <div className="task-checkbox checked" />
                    <div className="task-info">
                      <div className="task-title">{task.title}</div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
