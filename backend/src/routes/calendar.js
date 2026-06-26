import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { createEvent, listEvents } from '../services/calendar.js';

const router = Router();

/**
 * POST /api/calendar/events
 * Creates a new calendar event.
 *
 * Body: { summary, description?, startDateTime, endDateTime, isAllDay? }
 */
router.post('/events', requireAuth, async (req, res) => {
  try {
    const { summary, description, startDateTime, endDateTime, isAllDay } = req.body;

    if (!summary || !startDateTime || !endDateTime) {
      return res.status(400).json({
        error: 'Campos obrigatórios: summary, startDateTime, endDateTime.',
      });
    }

    const event = await createEvent(req.oauth2Client, {
      summary,
      description,
      startDateTime,
      endDateTime,
      isAllDay: isAllDay || false,
    });

    res.status(201).json({ event });
  } catch (err) {
    console.error('Erro ao criar evento:', err.message);
    res.status(500).json({ error: 'Erro ao criar evento no Calendar.' });
  }
});

/**
 * GET /api/calendar/events
 * Lists calendar events within a date range.
 *
 * Query: ?startDate=...&endDate=...
 */
router.get('/events', requireAuth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        error: 'Parâmetros obrigatórios: startDate, endDate.',
      });
    }

    const events = await listEvents(req.oauth2Client, { startDate, endDate });
    res.json({ events });
  } catch (err) {
    console.error('Erro ao listar eventos:', err.message);
    res.status(500).json({ error: 'Erro ao listar eventos do Calendar.' });
  }
});

export default router;
