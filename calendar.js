
import { google } from 'googleapis';


// Google Calendar API needs a start and end time in ISO format, and we want everything from midnight to 11:59pm today.
//returns an object with start and end properties in ISO format for today

function getTodayRange() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return {
    start: start.toISOString(),
    end: end.toISOString()
  };
}


// called from index.js with the authorized Google client

export async function getEvents(authClient) {
  const calendar = google.calendar({ version: 'v3', auth: authClient });
  const { start, end } = getTodayRange();
  const res = await calendar.events.list({
    calendarId: 'primary',
    timeMin: start,
    timeMax: end,
    singleEvents: true,
    orderBy: 'startTime',
  });

  //structure the events to show event name, the time and the duration
  const events = res.data.items || [];
  return events.map(event => {
    const startTime = new Date(event.start.dateTime);
    const endTime = new Date(event.end.dateTime);
    const durationMs = endTime - startTime;
    const durationMinutes = Math.floor(durationMs / (1000 * 60));
    return {
      title: event.summary,
      time: startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      duration: durationMinutes,
    };
  });
}
