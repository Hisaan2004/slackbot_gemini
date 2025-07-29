// File: pages/api/slack/webhook.js
/*
import { handleUserQuestion } from "@/app/api/chatbot/route.js"; // this contains search + Gemini
import { WebClient } from "@slack/web-api";
import dotenv from "dotenv";

dotenv.config();

const slackClient = new WebClient(process.env.SLACK_BOT_TOKEN);

export default async function handler(req, res) {
  /*if (req.method !== "POST") {
    return res.status(405).json({ message: "Only POST allowed" });
  }*//*
 if (req.method !== "POST") {
    return res.status(405).json({ message: "Only POST allowed" });
  }

  // ⚠️ Handle Slack URL verification first
  if (req.body.type === "url_verification") {
    return res.status(200).json({ challenge: req.body.challenge });
  }

  const { event } = req.body;

  // Slack URL verification (if you're setting up for the first time)
  if (req.body.type === "url_verification") {
    return res.status(200).json({ challenge: req.body.challenge });
  }

  try {
    // Ignore bot messages
    if (event?.subtype === "bot_message") {
      return res.status(200).end();
    }

    const userMessage = event.text;
    const channel = event.channel;

    // Step 1: Process the message
    const botReply = await handleUserQuestion(userMessage); // this calls your embedding + Gemini logic

    // Step 2: Respond back to Slack
    await slackClient.chat.postMessage({
      channel,
      text: botReply,
    });

    return res.status(200).json({ status: "Message processed" });
  } catch (err) {
    console.error("Slack webhook error:", err);
    return res.status(500).json({ error: "Something went wrong" });
  }
}*/
// File: pages/api/slack/webhook.js
/*
import { handleUserQuestion } from "@/app/api/chatbot/route.js"; // Gemini + search logic
import { WebClient } from "@slack/web-api";
import dotenv from "dotenv";

dotenv.config();

const slackClient = new WebClient(process.env.SLACK_BOT_TOKEN);

export default async function handler(req, res) {
  // ✅ Accept only POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Only POST allowed" });
  }

  // ✅ Handle Slack URL verification FIRST
  if (req.body.type === "url_verification") {
    return res.status(200).json({ challenge: req.body.challenge });
  }

  // ✅ Destructure incoming event
  const { event } = req.body;

  try {
    // 🛑 Ignore bot-generated messages
    if (event?.subtype === "bot_message") {
      return res.status(200).end();
    }

    // ✅ Extract user message and channel
    const userMessage = event.text;
    const channel = event.channel;

    // 🤖 Generate bot reply using Gemini
    const botReply = await handleUserQuestion(userMessage);

    // 📣 Respond back to Slack
    await slackClient.chat.postMessage({
      channel,
      text: botReply,
    });

    return res.status(200).json({ status: "Message processed" });
  } catch (err) {
    console.error("Slack webhook error:", err);
    return res.status(500).json({ error: "Something went wrong" });
  }
}
*/
/*
import { handleUserQuestion } from "@/app/api/chatbot/route.js";
import { WebClient } from "@slack/web-api";
import dotenv from "dotenv";

dotenv.config();

const slackClient = new WebClient(process.env.SLACK_BOT_TOKEN);

export async function POST(request) {
  try {
    const body = await request.json();

    // ✅ Slack URL verification
    if (body.type === "url_verification") {
      return new Response(JSON.stringify({ challenge: body.challenge }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { event } = body;

    // 🛑 Ignore bot messages
    if (event?.subtype === "bot_message") {
      return new Response("Ignored bot message", { status: 200 });
    }

    const userMessage = event.text;
    const channel = event.channel;

    // 🤖 Generate response
    const botReply = await handleUserQuestion(userMessage);

    // 📣 Send message back to Slack
    await slackClient.chat.postMessage({
      channel,
      text: botReply,
    });

    return new Response(JSON.stringify({ status: "Message processed" }), {
      status: 200,
    });
  } catch (error) {
    console.error("Slack webhook error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });//this one was working fine but infinte loop
  }
}
*/
/*
import { handleUserQuestion } from "@/app/api/chatbot/route.js";
import { WebClient } from "@slack/web-api";
import dotenv from "dotenv";

dotenv.config();

const slackClient = new WebClient(process.env.SLACK_BOT_TOKEN);

// Store bot user ID
let botUserId = null;
async function getBotUserId() {
  if (!botUserId) {
    const auth = await slackClient.auth.test();
    botUserId = auth.user_id;
  }
  return botUserId;
}

export async function POST(request) {
  try {
    const body = await request.json();

    // ✅ Slack URL verification
    if (body.type === "url_verification") {
      return new Response(JSON.stringify({ challenge: body.challenge }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { event } = body;

    // ⛔ Ignore bot messages (extra safety)
    if (event?.subtype === "bot_message") {
      return new Response("Ignored bot message (subtype)", { status: 200 });
    }

    // ⛔ Ignore own messages (based on user ID)
    const botId = await getBotUserId();
    if (event.user === botId) {
      return new Response("Ignored self message (bot ID)", { status: 200 });
    }

    const userMessage = event.text;
    const channel = event.channel;

    // 🤖 Generate response
    const botReply = await handleUserQuestion(userMessage);

    // 📣 Send message back to Slack
    await slackClient.chat.postMessage({
      channel,
      text: botReply,
    });

    return new Response(JSON.stringify({ status: "Message processed" }), {
      status: 200,
    });
  } catch (error) {
    console.error("Slack webhook error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}
*//*
import { handleUserQuestion } from "@/app/api/chatbot/route.js";
import { WebClient } from "@slack/web-api";
import dotenv from "dotenv";

dotenv.config();

const slackClient = new WebClient(process.env.SLACK_BOT_TOKEN);

// Only fetch once
let botUserId = null;
async function getBotUserId() {
  if (!botUserId) {
    const auth = await slackClient.auth.test();
    botUserId = auth.user_id;
  }
  return botUserId;
}

export async function POST(request) {
  try {
    const body = await request.json();

    // ✅ Slack URL verification
    if (body.type === "url_verification") {
      return new Response(JSON.stringify({ challenge: body.challenge }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { event } = body;

    // ⛔ Ignore if event is missing
    if (!event) {
      return new Response("No event found", { status: 200 });
    }

    // ⛔ Ignore bot messages
    if (event.subtype === "bot_message") {
      return new Response("Ignored bot message", { status: 200 });
    }

    // ⛔ Ignore self messages (from bot)
    const botId = await getBotUserId();
    if (event.user === botId) {
      return new Response("Ignored self message", { status: 200 });
    }

    const userMessage = event.text;
    const channel = event.channel;

    let botReply;

    try {
      // 🤖 Generate response
      botReply = await handleUserQuestion(userMessage);

      // Fallback if botReply is undefined/null
      if (!botReply) {
        botReply = "I didn't understand that. Try asking differently.";
      }
    } catch (err) {
      console.error("Error in handleUserQuestion:", err);
      botReply = "Sorry, something went wrong while answering your question.";
    }

    // 📣 Send message back to Slack
    await slackClient.chat.postMessage({
      channel,
      text: botReply,
    });

    return new Response(JSON.stringify({ status: "Message processed" }), {
      status: 200,
    });
  } catch (error) {
    console.error("Slack webhook error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 200, // Return 200 to avoid Slack retry loop
    });
  }
}*/
// File: pages/api/slack/webhook.js
// 
/*
import dotenv from "dotenv";
import { WebClient } from "@slack/web-api";
import { handleUserQuestion } from "@/app/api/chatbot/route.js"; // adjust as needed

dotenv.config();

const slackClient = new WebClient(process.env.SLACK_BOT_TOKEN);
const processedEvents = new Set();

export default async function handler(req, res) {
  // ✅ Handle Slack URL verification
  if (req.method === "POST" && req.body.type === "url_verification") {
    return res.status(200).send(req.body.challenge);
  }

  // ✅ Only respond to events
  if (req.method !== "POST" || !req.body.event) {
    return res.status(400).json({ error: "Invalid request" });
  }

  const { event } = req.body;

  // ✅ Prevent duplicate processing
  if (processedEvents.has(event.event_ts)) {
    return res.status(200).end();
  }
  processedEvents.add(event.event_ts);

  // ✅ Acknowledge to Slack immediately
  res.status(200).end();

  try {
    const userMessage = event.text;
    const channelId = event.channel;

    // ❌ Do not send a message inside handleUserQuestion
    const botReply = await handleUserQuestion(userMessage);

    await slackClient.chat.postMessage({
      channel: channelId,
      text: botReply || "I'm not sure how to respond to that.",
    });
  } catch (err) {
    console.error("Error processing Slack event:", err.message);

    await slackClient.chat.postMessage({
      channel: event.channel,
      text: "Sorry, something went wrong while answering your question.",
    });
  }
}*//*import { WebClient } from "@slack/web-api";
import dotenv from "dotenv";
import { handleUserQuestion } from "@/app/api/chatbot/route.js"; // or adjust path

dotenv.config();

const slackClient = new WebClient(process.env.SLACK_BOT_TOKEN);
const processedEvents = new Set();

export async function POST(req) {
  const body = await req.json();

  // ✅ Slack URL verification
  if (body.type === "url_verification") {
    return new Response(body.challenge, { status: 200 });
  }

  // ✅ Validate request
  if (!body.event) {
    return new Response(JSON.stringify({ error: "Invalid request" }), {
      status: 400,
    });
  }

  const event = body.event;

  // ✅ Avoid duplicate events
  if (processedEvents.has(event.event_ts)) {
    return new Response(null, { status: 200 });
  }
  processedEvents.add(event.event_ts);

  // ✅ Acknowledge immediately
  const response = new Response(null, { status: 200 });

  try {
    const userMessage = event.text;
    const channelId = event.channel;

    const botReply = await handleUserQuestion(userMessage);

    await slackClient.chat.postMessage({
      channel: channelId,
      text: botReply || "I'm not sure how to respond to that.",
    });
  } catch (err) {
    console.error("Error:", err.message);

    await slackClient.chat.postMessage({
      channel: event.channel,
      text: "Sorry, something went wrong while answering your question.",
    });
  }

  return response;
}

export async function GET() {
  return new Response("Slack bot is running!", { status: 200 });
}

*/
import axios from "axios";
import dotenv from "dotenv";
import { handleUserQuestion } from "@/app/api/chatbot/route.js";

dotenv.config();

const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN;
const processedEvents = new Set();

export const config = {
  api: {
    bodyParser: true,
  },
};

export async function POST(req) {
  const body = await req.json();
  const { type, event, challenge, event_id } = body;

  // ✅ URL verification for Slack Events API
  if (type === "url_verification") {
    return new Response(challenge, { status: 200 });
  }

  // ✅ Always ACK the request FIRST to avoid retries
  const ackResponse = new Response(null, { status: 200 });

  // 🔁 Prevent duplicate event processing
  if (processedEvents.has(event_id)) {
    console.log("Duplicate event ignored:", event_id);
    return ackResponse;
  }

  processedEvents.add(event_id);

  // ✅ Handle user messages (ignore bot replies)
  if (event && event.type === "message" && !event.bot_id) {
    const userMessage = event.text;
    const channelId = event.channel;

    console.log("Received:", userMessage);

    // 🔄 Process message asynchronously (outside of main response)
    (async () => {
      try {
        const reply = await handleUserQuestion(userMessage);

        await axios.post(
          "https://slack.com/api/chat.postMessage",
          {
            channel: channelId,
            text: reply || "Sorry, I couldn't generate a response.",
          },
          {
            headers: {
              Authorization: `Bearer ${SLACK_BOT_TOKEN}`,
              "Content-Type": "application/json",
            },
          }
        );
      } catch (error) {
        console.error("❌ Error responding to Slack:", error.message);
      }
    })();
  }

  return ackResponse;
}

export async function GET() {
  return new Response("Slack bot is running!", { status: 200 });
}


