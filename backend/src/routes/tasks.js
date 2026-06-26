import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { createTask, listTasks, completeTask } from '../services/tasks.js';

const router = Router();

/**
 * POST /api/tasks
 * Creates a new task (and a corresponding calendar event).
 *
 * Body: { title, notes?, dueDate }
 */
router.post('/', requireAuth, async (req, res) => {
  try {
    const { title, notes, dueDate } = req.body;

    if (!title || !dueDate) {
      return res.status(400).json({
        error: 'Campos obrigatórios: title, dueDate.',
      });
    }

    const task = await createTask(req.oauth2Client, { title, notes, dueDate });
    res.status(201).json({ task });
  } catch (err) {
    console.error('Erro ao criar tarefa:', err.message);
    res.status(500).json({ error: 'Erro ao criar tarefa.' });
  }
});

/**
 * GET /api/tasks
 * Lists all pending tasks.
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const tasks = await listTasks(req.oauth2Client);
    res.json({ tasks });
  } catch (err) {
    console.error('Erro ao listar tarefas:', err.message);
    res.status(500).json({ error: 'Erro ao listar tarefas.' });
  }
});

/**
 * PATCH /api/tasks/:taskId/complete
 * Marks a task as completed.
 */
router.patch('/:taskId/complete', requireAuth, async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await completeTask(req.oauth2Client, { taskId });
    res.json({ task });
  } catch (err) {
    console.error('Erro ao completar tarefa:', err.message);
    res.status(500).json({ error: 'Erro ao completar tarefa.' });
  }
});

export default router;
