import { useState, useEffect } from 'react';
import { Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';
import './Dashboard.css';

export default function Dashboard() {
  const [tasks, setTasks] = useState({ hard: [], soft: [] });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadTasks() {
      try {
        const response = await api.getTasks();
        
        // Separa tarefas por Hard e Soft
        const hardTasks = [];
        const softTasks = [];

        response.tasks.forEach(task => {
          if (task.notes && task.notes.includes('Hard')) {
            hardTasks.push(task);
          } else {
            softTasks.push(task);
          }
        });

        // Ordena ambas por data cronológica
        const sortByDate = (a, b) => new Date(a.due || '2999-01-01') - new Date(b.due || '2999-01-01');
        hardTasks.sort(sortByDate);
        softTasks.sort(sortByDate);

        setTasks({ hard: hardTasks, soft: softTasks });
      } catch (err) {
        console.error('Erro ao buscar tarefas:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadTasks();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'Sem data';
    const date = new Date(dateString);
    const today = new Date();
    
    // Zera as horas para comparar só o dia
    date.setHours(0,0,0,0);
    today.setHours(0,0,0,0);
    
    const diffTime = date - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hoje';
    if (diffDays === 1) return 'Amanhã';
    if (diffDays === -1) return 'Ontem';
    if (diffDays > 1 && diffDays < 7) {
      return date.toLocaleDateString('pt-BR', { weekday: 'long' }).split('-')[0]; // ex: "quinta"
    }
    
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  const handleComplete = async (taskId) => {
    try {
      await api.updateTask(taskId, { status: 'completed' }); // ou a rota correta (PATCH /:id/complete)
      // Atualiza o state local para sumir a tarefa
      setTasks(prev => ({
        hard: prev.hard.filter(t => t.id !== taskId),
        soft: prev.soft.filter(t => t.id !== taskId),
      }));
    } catch (err) {
      console.error('Erro ao completar', err);
    }
  };

  if (isLoading) {
    return (
      <div className="dashboard-container loading-container">
        <div className="spinner"></div>
        <p>Carregando sua visão geral...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container animate-fade-in">
      <div className="hero-section">
        <h1 className="greeting">Bom dia, Pedro!</h1>
        <p className="subtitle">Aqui está o que temos pela frente.</p>
      </div>

      <div className="tasks-grid">
        {/* HARD TASKS COLUMN */}
        <div className="task-column hard-column">
          <div className="column-header">
            <AlertCircle className="column-icon hard-icon" />
            <h2>Prioridade Hard</h2>
            <span className="badge hard-badge">{tasks.hard.length}</span>
          </div>
          
          <div className="task-list">
            {tasks.hard.length === 0 ? (
              <p className="empty-state">Nenhuma tarefa Hard pendente. Pode respirar!</p>
            ) : (
              tasks.hard.map(task => (
                <div key={task.id} className="task-card hard-card glass-card">
                  <div className="task-content">
                    <h3 className="task-title">{task.title}</h3>
                    <div className="task-meta">
                      <Clock size={14} />
                      <span>{formatDate(task.due)}</span>
                    </div>
                  </div>
                  <button onClick={() => handleComplete(task.id)} className="complete-btn" title="Concluir Tarefa">
                    <CheckCircle2 />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* SOFT TASKS COLUMN */}
        <div className="task-column soft-column">
          <div className="column-header">
            <CheckCircle2 className="column-icon soft-icon" />
            <h2>Prioridade Soft</h2>
            <span className="badge soft-badge">{tasks.soft.length}</span>
          </div>
          
          <div className="task-list">
            {tasks.soft.length === 0 ? (
              <p className="empty-state">Nenhuma tarefa Soft pendente.</p>
            ) : (
              tasks.soft.map(task => (
                <div key={task.id} className="task-card soft-card glass-card">
                  <div className="task-content">
                    <h3 className="task-title">{task.title}</h3>
                    <div className="task-meta">
                      <Clock size={14} />
                      <span>{formatDate(task.due)}</span>
                    </div>
                  </div>
                  <button onClick={() => handleComplete(task.id)} className="complete-btn" title="Concluir Tarefa">
                    <CheckCircle2 />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
