/**
 * Function calling definitions for Gemini AI.
 * These define the tools that Gemini can invoke to interact with Google APIs.
 */

export const functionDeclarations = [
  {
    name: 'create_calendar_event',
    description:
      'Cria um novo evento no Google Calendar do usuário. Use quando o usuário pedir para agendar, marcar, criar um compromisso, reunião, evento, ou qualquer atividade com data e horário.',
    parameters: {
      type: 'object',
      properties: {
        summary: {
          type: 'string',
          description: 'Título ou nome do evento.',
        },
        description: {
          type: 'string',
          description: 'Descrição detalhada do evento (opcional).',
        },
        startDateTime: {
          type: 'string',
          description:
            'Data e hora de início no formato ISO 8601 (ex: 2026-06-25T14:00:00-03:00). Para eventos de dia inteiro, use apenas a data (ex: 2026-06-25).',
        },
        endDateTime: {
          type: 'string',
          description:
            'Data e hora de término no formato ISO 8601 (ex: 2026-06-25T15:00:00-03:00). Para eventos de dia inteiro, use a data do dia seguinte (ex: 2026-06-26).',
        },
        isAllDay: {
          type: 'boolean',
          description: 'Se true, o evento é de dia inteiro e usa apenas datas sem horário.',
        },
      },
      required: ['summary', 'startDateTime', 'endDateTime'],
    },
  },
  {
    name: 'create_task',
    description:
      'Cria uma nova tarefa no Google Tasks do usuário e também cria um evento correspondente no Calendar. Use quando o usuário pedir para criar tarefa, lembrete, to-do, ou algo que precisa ser feito até uma data.',
    parameters: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Título da tarefa.',
        },
        notes: {
          type: 'string',
          description: 'Notas ou descrição adicional da tarefa (opcional).',
        },
        dueDate: {
          type: 'string',
          description:
            'Data de vencimento da tarefa no formato ISO 8601 (ex: 2026-06-30T00:00:00.000Z ou 2026-06-30).',
        },
      },
      required: ['title', 'dueDate'],
    },
  },
  {
    name: 'list_events',
    description:
      'Lista os eventos do Google Calendar do usuário em um período de tempo. Use quando o usuário perguntar sobre seus compromissos, agenda, eventos, ou o que tem marcado.',
    parameters: {
      type: 'object',
      properties: {
        startDate: {
          type: 'string',
          description:
            'Data de início do período para buscar eventos, no formato ISO 8601 (ex: 2026-06-24T00:00:00-03:00).',
        },
        endDate: {
          type: 'string',
          description:
            'Data de fim do período para buscar eventos, no formato ISO 8601 (ex: 2026-06-30T23:59:59-03:00).',
        },
      },
      required: ['startDate', 'endDate'],
    },
  },
  {
    name: 'list_tasks',
    description:
      'Lista todas as tarefas pendentes do Google Tasks do usuário. Use quando o usuário perguntar sobre suas tarefas, to-dos, ou o que precisa fazer.',
    parameters: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'complete_task',
    description:
      'Marca uma tarefa como concluída no Google Tasks. Use quando o usuário disser que completou, terminou, ou finalizou uma tarefa.',
    parameters: {
      type: 'object',
      properties: {
        taskId: {
          type: 'string',
          description: 'ID da tarefa a ser marcada como concluída.',
        },
      },
      required: ['taskId'],
    },
  },
  {
    name: 'general_response',
    description:
      'Resposta geral para conversas normais, saudações, perguntas que não envolvem ações no Calendar ou Tasks. Use quando não há nenhuma ação a ser executada.',
    parameters: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          description: 'A mensagem de resposta para o usuário.',
        },
      },
      required: ['message'],
    },
  },
];
