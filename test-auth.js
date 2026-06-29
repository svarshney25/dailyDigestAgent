import { authorize } from './auth.js';
import { getEmails } from './gmail.js';
import { getEvents } from './calendar.js';

const auth = await authorize();
console.log('Google auth works!');

const emails = await getEmails(auth);
console.log('Emails fetched:', emails.length);

const events = await getEvents(auth);
console.log('Events fetched:', events.length);
