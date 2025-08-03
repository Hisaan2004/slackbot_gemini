
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
    const userId = event.user;

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
