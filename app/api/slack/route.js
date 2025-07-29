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

