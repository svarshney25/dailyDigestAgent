
//Daily Digest Agent
import Anthropic from '@anthropic-ai/sdk';
import 'dotenv/config';
import {getEmails} from './gmail.js';
import {getEvents} from './calendar.js';
import {authorize} from './auth.js';

const client = new Anthropic();


//storing real email data, but keeping variable name from the mock data 
const mockEmails = await getEmails();

const mockCalendarEvents = await getCalendarEvents();


//system prompt to format the briefing
const SYSTEM_PROMPT = `
You are a personal assistant that delivers a concise, well-structured daily briefing.
Format the briefing in clear sections using the data provided.

Emails: Summarize and prioritize the most important emails. Highlight urgent ones that contain keywords like "EOD", "URGENT", or "meeting today".

Calendar: List today's events in order. Flag any conflicts or tight gaps between meetings.

Weather: Provide a brief forecast including temperature, precipitation chance, and sunset time for the user's city.

News: Summarize the top business and tech/AI headlines. Include new startups, AI releases, and market moves worth knowing about.

Tone: Professional and concise but with a little personality.
Use emojis for each section header.
End with a fun non-business fact and a trivia question related to one of the news stories.
`;

//creating user message and using web_search for weather/news
function buildUserMessage(emails, events) {
  const intro = "Good morning! Here is your daily briefing for " + new Date().toLocaleDateString() + ":\n\n";
  const email = "Emails:\n" + JSON.stringify(mockEmails, null, 2) + "\n\n";
  const calendar = "Calendar:\n" + JSON.stringify(mockCalendarEvents, null, 2) + "\n\n";
  const newsRequest = "Please search for the top business and tech/AI news headlines.\n\n";
  const weatherRequest = "Please provide the weather forecast for Malvern, Pennsylvania.\n\n";

  return intro + email + calendar + newsRequest + weatherRequest;
}

// console.log(buildUserMessage());


/* agent loop that repeats multiple times until the web search has found everything it needs
if Claude uses a tool, the loop will send the tool result back to Claude and ask for
more information. if claude didn't use a tool, the loop will print the final briefing and exit
*/
async function runAgent() {
    const authClient = await authorize();
    const email = await getEmails(authClient);
    const calendar = await getEvents(authClient);
    const messages = [
    { role: 'user', content: buildUserMessage(email, calendar) }
  ];

  const tools = [
    {
      type: 'web_search_20250305',
      name: 'web_search',
    }
    
  ];

  // Each iteration: check response.content for tool_use blocks,
  // collect them, push back as tool_result, then call the API again
  while (true) {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      messages,
      system: SYSTEM_PROMPT,
      tools,
      max_tokens: 1024,
    });

    // add Claude's response to the conversation history
    messages.push({ role: 'assistant', content: response.content });

    if (response.stop_reason === 'tool_use') {
      // find all tool use blocks and wrap them as tool_results
        const toolResults = response.content
            .filter(block => block.type === 'tool_use')
            .map(block => ({
            type: 'tool_result',
            tool_use_id: block.id,
            content: block.content ?? '',
            }));

        // send the results back so Claude can continue
        messages.push({ role: 'user', content: toolResults });

    } else {
      // Claude is done so extract and print the final text
      const finalText = response.content
        .filter(block => block.type === 'text')
        .map(block => block.text)
        .join('\n');

      console.log("\n── Daily Briefing ──\n");
      console.log(finalText);
      break;
    }
    }
}


//run agent and handle errors to see what went wrong without a cryptic stack trace.

runAgent().catch(err => {
  console.error('Something went wrong:', err.message);
  process.exit(1);
});