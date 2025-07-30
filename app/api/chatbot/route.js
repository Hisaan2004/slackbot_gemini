/*import { google } from "@/services/gemini/index.js";
import { generateText } from "ai";
import { searchRelevantQA } from "@/lib/embedding/fetchQueryEmbedding.js";
import CHATBOT_PROPMPT from "@/lib/chatbot/Prompt.js";
export const handleUserQuestion = async (userPrompt) => {
  try {
    const topResults = await searchRelevantQA(userPrompt);

    const context = topResults
      .map((item, idx) => `Q${idx + 1}: ${item.question}\nA${idx + 1}: ${item.answer}`)
      .join("\n\n");
    const finalPrompt = CHATBOT_PROPMPT(context,userPrompt);

    const model = google("models/gemini-1.5-flash-latest");

    const result = await generateText({
      model,
      messages: [{ role: "user", content: finalPrompt }],
    });

    return result.text;
  } catch (err) {
    console.error("Error in chatbot:", err);
    return "Sorry, something went wrong while answering your question.";
  }
};*/
import { redis } from "@/services/redis/index.js";
import { google } from "@/services/gemini/index.js";
import { generateText } from "ai";
import { searchRelevantQA } from "@/lib/embedding/fetchQueryEmbedding.js";
import CHATBOT_PROPMPT from "@/lib/chatbot/Prompt.js";
let meetingState = {
  step: null,      // e.g., 'name', 'email', 'date', 'time'
  name: null,
  email: null,
  date: null,
  time: null,
  started: false,
};
const isMeetingRequest = (input) => {
  const keywords = ["meeting", "schedule", "appointment", "meet"];
  return keywords.some((kw) => input.toLowerCase().includes(kw));
};
const MEETING_INITIAL_PROMPT = "Do you want to schedule a meeting with our representative? Answer with yes or no.";
/*
const MEETING_INITIAL_PROMPT = "Do you want to schedule a meeting with our representative? Answer with yes or no.";
const EMAIL_PROMPT="Please enter your full name";
const NAME_PROMPT="lease enter your email address";
const Date_PROMPT="please enter the date you want to schedule meeting format(DD-MM-YYYY)";
const TIME_PROMPT="please enter the time between 11:00 to 17:00 format should be (HH:MM)"
let meetingHistory=[];
const isMeetingRequest = (input) => {
  const keywords = ["meeting", "schedule", "appointment", "meet"];
  return keywords.some((kw) => input.toLowerCase().includes(kw));
};

export const handleUserQuestion = async (userPrompt) => {
  try {
    const lowerPrompt = userPrompt.toLowerCase();

    // Step 1: Detect intent (e.g. user says "I want to set a meeting")
    if (isMeetingRequest(lowerPrompt)) {
      if (!meetingHistory.includes("meeting-requested")) {
        meetingHistory.push("meeting-requested");
        return MEETING_INITIAL_PROMPT; // Ask: "Do you want to schedule a meeting?"
      }
    }

    // Step 2: Detect user response (yes/no)
    if (meetingHistory.includes("meeting-requested")) {
      if (lowerPrompt.includes("yes")) {
        if (!meetingHistory.includes("user-confirmed")) {
          meetingHistory.push("user-confirmed");
        }
      } else if (lowerPrompt.includes("no")) {
        meetingHistory = []; // Clear meeting flow
        return "Okay, no meeting will be scheduled.";
      }
    }

    const hasRequested = meetingHistory.includes("meeting-requested");
    const hasConfirmed = meetingHistory.includes("user-confirmed");

   if (hasRequested && hasConfirmed) {
  const prompt = MEETING_FLOW_PROMPT("", "Let's start scheduling your meeting.");
  const model = google("models/gemini-1.5-flash-latest");

  let result;
  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    try {
      result = await generateText({
        model,
        messages: [{ role: "user", content: prompt }],
      });
      break; // success, exit the loop
    } catch (error) {
      if (error?.statusCode === 503 || error?.reason === 'maxRetriesExceeded') {
        const delay = 2000 * (attempts + 1); // backoff: 2s, 4s, 6s...
        console.warn(`Model overloaded. Retrying in ${delay / 1000}s...`);
        await new Promise((res) => setTimeout(res, delay));
        attempts++;
      } else {
        throw error; // rethrow other errors
      }
    }
  }

  if (!result) throw new Error("Failed to generate response after retries.");

  meetingHistory = [];
  return result.text;
}
    const topResults = await searchRelevantQA(userPrompt);

    const context = topResults
      .map((item, idx) => `Q${idx + 1}: ${item.question}\nA${idx + 1}: ${item.answer}`)
      .join("\n\n");

    const finalPrompt = CHATBOT_PROPMPT(context, userPrompt);
    const model = google("models/gemini-1.5-flash-latest");

    const maxRetries = 3;
    let result;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        result = await generateText({
          model,
          messages: [{ role: "user", content: finalPrompt }],
        });
        break; // Success, break retry loop
      } catch (error) {
        console.warn(`Attempt ${attempt} failed:`, error.message);
        if (attempt === maxRetries) {
          throw error; // Let outer catch handle it
        }
        const delay = 1000 * attempt; // 1s → 2s → 3s
        await new Promise((res) => setTimeout(res, delay));
      }
    }

    return result.text;
  } catch (err) {
    console.error("Error in chatbot:", err);
    return "Sorry, something went wrong while answering your question. Please try again later.";
  }
};*/
export const handleUserQuestion = async (userPrompt,userId) => {
  try {
    const lowerPrompt = userPrompt.toLowerCase();
    let meetingState = await redis.get(`meetingState:${userId}`);
    if (!meetingState) meetingState = { ...defaultState };
    // STEP 1: Detect intent to schedule a meeting
    if (isMeetingRequest(lowerPrompt) && !meetingState.started) {
      meetingState.started = true;
      meetingState.step = "confirmation";
      await redis.set(`meetingState:${userId}`, meetingState);
      return MEETING_INITIAL_PROMPT;
    }

    // STEP 2: Handle confirmation
    if (meetingState.started && meetingState.step === "confirmation") {
      if (lowerPrompt.includes("yes")) {
        meetingState.step = "name";
        await redis.set(`meetingState:${userId}`, meetingState);
        return "Please enter your full name.";
      } else if (lowerPrompt.includes("no")) {
      //  meetingState = { step: null, name: null, email: null, date: null, time: null, started: false };
        await redis.del(`meetingState:${userId}`);
        return "Okay, no meeting will be scheduled.";
      }
    }

    // STEP 3: Capture each field sequentially
    if (meetingState.step === "name") {
      meetingState.name = userPrompt;
      meetingState.step = "email";
      await redis.set(`meetingState:${userId}`, meetingState);
      return "Please enter your email address.";
    }

    if (meetingState.step === "email") {
      meetingState.email = userPrompt;
      meetingState.step = "date";
      await redis.set(`meetingState:${userId}`, meetingState);
      return "Please enter the date for the meeting (format: DD-MM-YYYY).";
    }

    if (meetingState.step === "date") {
      meetingState.date = userPrompt;
      meetingState.step = "time";
      await redis.set(`meetingState:${userId}`, meetingState);
      return "Please enter the time for the meeting between 11:00 and 17:00 (format: HH:MM).";
    }

    if (meetingState.step === "time") {
      meetingState.time = userPrompt;

      // All info collected
      const summary = `
✅ Meeting Scheduled!

**Name**: ${meetingState.name}  
**Email**: ${meetingState.email}  
**Date**: ${meetingState.date}  
**Time**: ${meetingState.time}  
**Google Meet Link**: https://meet.google.com/bot-ified-meeting  

Let us know if you'd like to reschedule.`;

      // Reset state
      //meetingState = { step: null, name: null, email: null, date: null, time: null, started: false };
      await redis.del(`meetingState:${userId}`);
      return summary;
    }

    // If not in meeting flow, handle as normal chatbot
    const topResults = await searchRelevantQA(userPrompt);
    const context = topResults
      .map((item, idx) => `Q${idx + 1}: ${item.question}\nA${idx + 1}: ${item.answer}`)
      .join("\n\n");

    const finalPrompt = CHATBOT_PROPMPT(context, userPrompt);
    const model = google("models/gemini-1.5-flash-latest");

    const maxRetries = 3;
    let result;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        result = await generateText({
          model,
          messages: [{ role: "user", content: finalPrompt }],
        });
        break;
      } catch (error) {
        console.warn(`Attempt ${attempt} failed:`, error.message);
        if (attempt === maxRetries) throw error;
        await new Promise((res) => setTimeout(res, 1000 * attempt));
      }
    }

    return result.text;
  } catch (err) {
    console.error("Error in chatbot:", err);
    return "Sorry, something went wrong while answering your question. Please try again later.";
  }
};

