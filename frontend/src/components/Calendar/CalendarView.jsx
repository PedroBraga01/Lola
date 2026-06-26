import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import './Calendar.css';

export default function CalendarView() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const start = new Date(currentDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(currentDate);
      end.setHours(23, 59, 59, 999);

      const data = await api.getEvents(start.toISOString(), end.toISOString());
      setEvents(data.events || []);
    } catch (err) {
      console.error('Erro ao carregar eventos:', err);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [currentDate]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const navigateDay = (offset) => {
    setCurrentDate((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() + offset);
      return next;
    });
  };

  const goToToday = () => setCurrentDate(new Date());

  const formatDate = (date) =>
    date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

  const formatEventTime = (dateTimeStr) => {
    if (!dateTimeStr) return 'Dia inteiro';
    const date = new Date(dateTimeStr);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const isToday = currentDate.toDateString() === new Date().toDateString();

  return (
    <div className="calendar-view" id="calendar-view">
      <div className="calendar-header">
        <h1 className="calendar-title">Agenda</h1>
        <div className="calendar-date-nav">
          <button className="calendar-nav-btn" onClick={() => navigateDay(-1)} id="cal-prev">
            ←
          </button>
          <button
            className="calendar-nav-btn"
            onClick={goToToday}
            style={isToday ? { borderColor: 'var(--color-primary)', color: 'var(--color-primary-light)' } : {}}
            id="cal-today"
          >
            Hoje
          </button>
          <span className="calendar-current-date">{formatDate(currentDate)}</span>
          <button className="calendar-nav-btn" onClick={() => navigateDay(1)} id="cal-next">
            →
          </button>
        </div>
      </div>

      <div className="calendar-events">
        {loading ? (
          <>
            <div className="calendar-skeleton" />
            <div className="calendar-skeleton" style={{ width: '80%' }} />
            <div className="calendar-skeleton" style={{ width: '60%' }} />
          </>
        ) : events.length === 0 ? (
          <div className="calendar-empty">
            <span className="calendar-empty-icon">📅</span>
            <p className="calendar-empty-text">
              Nenhum evento para {isToday ? 'hoje' : 'este dia'}.
              <br />
              <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
                Peça à Lola para criar um evento no chat!
              </span>
            </p>
          </div>
        ) : (
          events.map((event, i) => (
            <div key={event.id || i} className="calendar-event-card">
              <div className="calendar-event-time">
                <span className="calendar-event-time-start">
                  {formatEventTime(event.start?.dateTime || event.start?.date)}
                </span>
                {event.end?.dateTime && (
                  <span className="calendar-event-time-end">
                    {formatEventTime(event.end.dateTime)}
                  </span>
                )}
              </div>
              <div className="calendar-event-info">
                <div className="calendar-event-title">{event.summary || 'Sem título'}</div>
                {event.description && (
                  <div className="calendar-event-description">{event.description}</div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
