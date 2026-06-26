import { google } from 'googleapis';

/**
 * Default reminders for all events:
 * - 3 days before (4320 minutes)
 * - 1 day before (1440 minutes)
 * - 1 hour before (60 minutes)
 */
const DEFAULT_REMINDERS = {
  useDefault: false,
  overrides: [
    { method: 'popup', minutes: 4320 },
    { method: 'popup', minutes: 1440 },
    { method: 'popup', minutes: 60 },
  ],
};

/**
 * Creates a new event in the user's primary Google Calendar.
 */
export async function createEvent(oauth2Client, { summary, description, startDateTime, endDateTime, isAllDay }) {
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  let start, end;

  if (isAllDay) {
    // All-day events use 'date' field (YYYY-MM-DD)
    start = { date: startDateTime.split('T')[0] };
    end = { date: endDateTime.split('T')[0] };
  } else {
    // Timed events use 'dateTime' field
    start = { dateTime: startDateTime, timeZone: 'America/Sao_Paulo' };
    end = { dateTime: endDateTime, timeZone: 'America/Sao_Paulo' };
  }

  const event = {
    summary,
    description: description || '',
    start,
    end,
    reminders: DEFAULT_REMINDERS,
  };

  const response = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: event,
  });

  return response.data;
}

/**
 * Lists events from the user's primary Google Calendar within a date range.
 */
export async function listEvents(oauth2Client, { startDate, endDate }) {
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  const response = await calendar.events.list({
    calendarId: 'primary',
    timeMin: startDate,
    timeMax: endDate,
    maxResults: 50,
    singleEvents: true,
    orderBy: 'startTime',
  });

  const events = response.data.items || [];

  return events.map((event) => ({
    id: event.id,
    summary: event.summary,
    description: event.description || '',
    start: event.start.dateTime || event.start.date,
    end: event.end.dateTime || event.end.date,
    htmlLink: event.htmlLink,
    isAllDay: !!event.start.date,
  }));
}
