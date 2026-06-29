**OVERVIEW**\
A personal AI agent that delivers a daily briefing powered by Claude. Every time you run it, it reads your Gmail,
checks your Google Calendar, fetches the latest business and tech/AI news, and gets your local weather.
It then summarizes everything into a quick daily briefing. It also ends with a quick fun fact and trivia question on the info
read.

**HOW IT WORKS**\
First, the model fetches your real emails and calendar events via the Google API. It then sends everything to Claude along with a 
request to search for news and weather. Claude uses the web search tool to find current information and writes and returns the briefing.\

The core of the app is an agent loop. Claude may call the web search tool multiple times before it has enough information 
to write the final briefing. The loop keeps running until it's done.

**SETUP**\
Step 1 - Install dependencies. Run npm install in the project folder.\
Step 2 - Set your Anthropic API key. Copy .env.example to .env and replace the placeholder with
your real key. Get your key at console.anthropic.com under API Keys.\
Step 3 - Create a Google Cloud project. Go to console.cloud.google.com and create a new project.
Then enable the Gmail API and the Google Calendar API under APIs & Services.\
Step 4 - Create OAuth credentials. Go to APIs & Services then Credentials then Create OAuth 2.0 Client
ID. Choose Desktop app as the type. Download the credentials.json file and place it in the root of the
project folder.\
Step 5 - Add yourself as a test user. Go to APIs & Services then OAuth consent screen then Test users
and add your Gmail address. This lets you log in without going through Google's verification process.\
Step 6 - Run the app. Type npm start in your terminal. On the first run a browser window will open
asking you to log into Google. After you approve, a token.json file is saved and you won't need to log in
again.\

DEPENDENCIES\
@anthropic-ai/sdk — Calls the Claude API\
googleapis — Calls Gmail and Google Calendar APIs\
dotenv — Loads your API key from .env\
open — Opens the browser for Google login\
