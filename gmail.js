
import { google } from 'googleapis';


// Gets a list of unread message IDs from Gmail, only returns IDs and not actual content

async function listUnreadEmails(gmail) {

  const res = await gmail.users.messages.list({
    userId: 'me',
    q: 'is:unread',
    maxResults: 10,
  });
  return res.data.messages || [];
}

// Takes a single message ID, fetches the full ddata and returns a clean from, subject, snippet object.
// the snippet is jsut a small preview of the content since we're not returning full email 

async function getEmailDetail(gmail, messageId) {

  const detail = await gmail.users.messages.get({
    userId: 'me',
    id: messageId,
    format: 'metadata',
    metadataHeaders: ['From', 'Subject'],
  }); 
  const headers = detail.data.payload.headers;
  const from = headers.find(h => h.name === 'From')?.value;
  const subject = headers.find(h => h.name === 'Subject')?.value;
  const snippet = detail.data.snippet;

  return { from, subject, snippet };
}


// called from index.js with the authorized Google client

export async function getEmails(authClient) {
  const gmail = google.gmail({ version: 'v1', auth: authClient });
  const messageIds = await listUnreadEmails(gmail);
  const emailDetails = await Promise.all(
    messageIds.map(msg => getEmailDetail(gmail, msg.id))
  );
  return emailDetails;
}
