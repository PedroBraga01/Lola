import { google } from 'googleapis';
import { createEvent } from './calendar.js';

/**
 * Gets the ID of the user's default task list (first one).
 */
async function getDefaultTaskListId(tasksApi) {
  const response = await tasksApi.tasklists.list({ maxResults: 1 });
  const taskLists = response.data.items || [];
  if (taskLists.length === 0) {
    throw new Error('Nenhuma lista de tarefas encontrada.');
  }
  return taskLists[0].id;
}

/**
 * Creates a new task in Google Tasks and a corresponding all-day event in Calendar.
 */
export async function createTask(oauth2Client, { title, notes, dueDate }) {
  const tasksApi = google.tasks({ version: 'v1', auth: oauth2Client });
  const taskListId = await getDefaultTaskListId(tasksApi);

  // Normalize dueDate to RFC 3339 format
  let dueDateFormatted = dueDate;
  if (dueDate && !dueDate.includes('T')) {
    dueDateFormatted = `${dueDate}T00:00:00.000Z`;
  }

  const task = {
    title,
    notes: notes || '',
    due: dueDateFormatted,
  };

  const response = await tasksApi.tasks.insert({
    tasklist: taskListId,
    requestBody: task,
  });

  // Also create an all-day calendar event for the task's due date
  if (dueDateFormatted) {
    try {
      const dateOnly = dueDateFormatted.split('T')[0];
      const endDate = new Date(dateOnly);
      endDate.setDate(endDate.getDate() + 1);
      const endDateStr = endDate.toISOString().split('T')[0];

      await createEvent(oauth2Client, {
        summary: `📋 Tarefa: ${title}`,
        description: notes ? `Tarefa: ${title}\n\n${notes}` : `Tarefa: ${title}`,
        startDateTime: dateOnly,
        endDateTime: endDateStr,
        isAllDay: true,
      });
    } catch (calErr) {
      console.warn('Aviso: Tarefa criada mas evento no Calendar falhou:', calErr.message);
    }
  }

  return response.data;
}

/**
 * Lists all pending (non-completed) tasks from the user's default task list.
 */
export async function listTasks(oauth2Client) {
  const tasksApi = google.tasks({ version: 'v1', auth: oauth2Client });
  const taskListId = await getDefaultTaskListId(tasksApi);

  const response = await tasksApi.tasks.list({
    tasklist: taskListId,
    showCompleted: false,
    showHidden: false,
    maxResults: 100,
  });

  const tasks = response.data.items || [];

  return tasks.map((task) => ({
    id: task.id,
    title: task.title,
    notes: task.notes || '',
    due: task.due || null,
    status: task.status,
    updated: task.updated,
  }));
}

/**
 * Marks a task as completed.
 */
export async function completeTask(oauth2Client, { taskId }) {
  const tasksApi = google.tasks({ version: 'v1', auth: oauth2Client });
  const taskListId = await getDefaultTaskListId(tasksApi);

  const response = await tasksApi.tasks.patch({
    tasklist: taskListId,
    task: taskId,
    requestBody: {
      status: 'completed',
    },
  });

  return response.data;
}
