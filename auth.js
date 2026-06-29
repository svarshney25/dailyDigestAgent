
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import http from 'http';
import { google } from 'googleapis';

// Tells Google what permissions your app need which help read calendar and Gmail

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/calendar.readonly',
];


// token.json is auto-generated after first login

const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');
const TOKEN_PATH = path.join(process.cwd(), 'token.json');

// Reads credentials.json file from Google Cloud Console and gives the client_id and client_secret for your app.

function loadCredentials() {
  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
  return credentials;
}

async function getNewToken(oAuth2Client) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });

  // open the browser automatically
  const open = (await import('open')).default;
  await open(authUrl);

  // spin up a temporary server to catch the redirect
  return new Promise((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      const code = new URL(req.url, 'http://localhost:3000').searchParams.get('code');
      if (!code) return;

      res.end('Authentication successful! You can close this tab.');
      server.close();

      const { tokens } = await oAuth2Client.getToken(code);
      oAuth2Client.setCredentials(tokens);
      fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
      console.log('Token saved — you are authenticated!');
      resolve(oAuth2Client);
    });

    server.listen(3000, () => {
      console.log('Waiting for Google login in your browser...');
    });
  });
}

//call this from index.js to get an authenticated client.
// If token.json exists: loads it and returns the client immediately.
// If not: runs the browser login flow first.

export async function authorize() {

  const credentials = loadCredentials();
  const { client_id, client_secret, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, 'http://localhost:3000');
  if (fs.existsSync(TOKEN_PATH)) {
    const token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));
    oAuth2Client.setCredentials(token);
    return oAuth2Client;
  } else {
    return await getNewToken(oAuth2Client);
  }
}
