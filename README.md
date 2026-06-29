A personal AI agent that delivers a daily briefing powered by Claude. Every time you run it, it reads your Gmail,
checks your Google Calendar, fetches the latest business and tech/AI news, and gets your local weather.
It then summarizes everything into a quick daily briefing. It also ends with a quick fun fact and trivia question on the info
read.

HOW IT WORKS
First, the model fetches your real emails and calendar events via the Google API. It then sends everything to Claude along with a 
request to search for news and weather. Claude uses the web search tool to find current information and writes and returns the briefing


The core of the app is an agent loop. Claude may call the web search tool multiple times before it has enough information 
to write the final briefing. The loop keeps running until it's done.
