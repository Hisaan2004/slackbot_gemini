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
}
*/
// File: pages/api/slack/webhook.js
/*
import { WebClient } from "@slack/web-api";
import dotenv from "dotenv";
import { handleUserQuestion } from "@/app/api/chatbot/route.js"; // Or wherever you defined it

dotenv.config();

const slackClient = new WebClient(process.env.SLACK_BOT_TOKEN);

// ✅ Your main handler function
export default async function handler(req, res) {
  // ✅ Respond only to POST
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const event = req.body.event;

    // ✅ Handle only message events (e.g., user messages in Slack)
    if (event && event.type === "message" && !event.bot_id) {
      const userQuestion = event.text;
      const channel = event.channel;

      // ✅ Call your logic (e.g., Gemini)
      const answer = await handleUserQuestion(userQuestion);

      // ✅ Send back to Slack
      await slackClient.chat.postMessage({
        channel,
        text: answer,
      });
    }

    // ✅ Respond success to Slack (required, even if no message sent)
    return res.status(200).json({ message: "Processed Slack event" });

  } catch (error) {
    console.error("Slack event error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}*/
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
/*
export async function POST(req) {
  const body = await req.json();
  const { type, event, challenge, event_id } = body;

  // 🔄 Slack's URL verification
  if (type === "url_verification") {
    return new Response(challenge, { status: 200 });
  }

  // ✅ Acknowledge immediately
  const response = new Response(null, { status: 200 });

  // ✅ Avoid duplicate event processing
  if (processedEvents.has(event_id)) {
    console.log("Duplicate event ignored:", event_id);
    return response;
  }
  processedEvents.add(event_id);

  if (event && event.type === "message" && !event.bot_id) {
    const userMessage = event.text;
    const channelId = event.channel;

    console.log("User message:", userMessage);
    console.log("Channel:", channelId);

    try {
      const reply = await handleUserQuestion(userMessage);

      await axios.post(
        "https://slack.com/api/chat.postMessage",
        {
          channel: channelId,
          text: reply,
        },
        {
          headers: {
            Authorization: `Bearer ${SLACK_BOT_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );
    } catch (error) {
      console.error("Error sending message to Slack:", error.message);
    }
  }

  return response;
}

export async function GET() {
  return new Response("Slack bot is running!", { status: 200 });
}
*/
export async function POST(req) {
  const body = await req.json();
  const { type, event, challenge } = body;

  const headers = req.headers;
  const isRetry = headers.get("x-slack-retry-num");

  // ❌ Ignore retries to prevent duplicate responses
  if (isRetry) {
    console.log("Duplicate Slack event - retry detected. Ignored.");
    return new Response(null, { status: 200 });
  }

  if (type === "url_verification") {
    return new Response(challenge, { status: 200 });
  }

  const response = new Response(null, { status: 200 });

  if (event && event.type === "message" && !event.bot_id) {
    const userMessage = event.text;
    const channelId = event.channel;
    const userId = req.body.event.user;

    try {
      const reply = await handleUserQuestion(userMessage,userId);

      await axios.post(
        "https://slack.com/api/chat.postMessage",
        {
          channel: channelId,
          text: reply,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );
    } catch (error) {
      console.error("Error sending message to Slack:", error.message);
    }
  }

  return response;
}
