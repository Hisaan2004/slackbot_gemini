/*
import { redis } from "@/services/redis/index.js";
import { google } from "@/services/gemini/index.js";
import { generateText } from "ai";
import { searchRelevantQA } from "@/lib/embedding/fetchQueryEmbedding.js";
import { checkAvailability, addToDB } from '@/lib/checkAvailability/index.js';
import CHATBOT_PROPMPT from "@/lib/chatbot/Prompt.js";
import { createGoogleMeetEvent } from '@/lib/googleMeetHelper/createMeet.js';

const defaultState = {
  step: null,
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

export const handleUserQuestion = async (userPrompt, userId) => {
  try {
    const lowerPrompt = userPrompt.toLowerCase();
    let meetingState = await redis.get(`meetingState:${userId}`);
    if (!meetingState) {
      meetingState = { ...defaultState };
    }

    if (isMeetingRequest(lowerPrompt) && !meetingState.started) {
      meetingState.started = true;
      meetingState.step = "confirmation";
      await redis.set(`meetingState:${userId}`, meetingState);
      return MEETING_INITIAL_PROMPT;
    }

    if (meetingState.started && meetingState.step === "confirmation") {
      if (lowerPrompt.includes("yes")) {
        meetingState.step = "name";
        await redis.set(`meetingState:${userId}`, meetingState);
        return "Please enter your full name. If you want to cancel, type 'No'.";
      } else if (lowerPrompt.includes("no")) {
        await deleteState(userId);
        return "Okay, no meeting will be scheduled.";
      } else {
        await deleteState(userId);
        return "Okay, no meeting will be scheduled.";
      }
    }

    if (meetingState.step === "name") {
      if (lowerPrompt.includes("no")) {
        await deleteState(userId);
        return "Okay, no meeting will be scheduled.";
      }
      meetingState.name = userPrompt;
      meetingState.step = "email";
      await redis.set(`meetingState:${userId}`, meetingState);
      return "Please enter your email address. If you want to cancel, type 'No'.";
    }

    if (meetingState.step === "email") {
      if (lowerPrompt.includes("no")) {
        await deleteState(userId);
        return "Okay, no meeting will be scheduled.";
      }
      let userEmail = userPrompt;
    
    const slackEmailMatch = userPrompt.match(/<mailto:[^|]+\|([^>]+)>/);

    if (slackEmailMatch && slackEmailMatch[1]) {
        userEmail = slackEmailMatch[1];
        console.log(`Extracted clean email from Slack format: ${userEmail}`);
    }

    meetingState.email = userEmail; 
      meetingState.step = "date"; 
      await redis.set(`meetingState:${userId}`, meetingState);
      return "Please enter the meeting date (format: DD-MM-YYYY).";
    }

    if (meetingState.step === "date") {
      if (lowerPrompt.includes("no")) {
        await deleteState(userId);
        return "Okay, no meeting will be scheduled.";
      }
      meetingState.date = userPrompt;
      meetingState.step = "time";
      await redis.set(`meetingState:${userId}`, meetingState);
      return "Please enter the time for the meeting (format: HH:MM between 11:00 and 17:00). If you want to cancel, type 'No'.";
    }

    if (meetingState.step === "time") {
      if (lowerPrompt.includes("no")) {
        await deleteState(userId);
        return "Okay, no meeting will be scheduled.";
      }

      meetingState.time = userPrompt;
      const check = await checkAvailability(meetingState.time, meetingState.date);

      if (check.available) {
        await addToDB(
          meetingState.name,
          meetingState.email,
          meetingState.time,
          meetingState.date
        );

      
        try {
        await createGoogleMeetEvent({
            name: meetingState.name,
            email: meetingState.email,
            date: meetingState.date,
            time: meetingState.time,
        });
    } catch (calendarError) {
        console.error("Could not create calendar event, but data is saved in DB.", calendarError);
    }


        const summary = `✅ Meeting Scheduled!

**Name**: ${meetingState.name}
**Email**: ${meetingState.email}
**Date**: ${meetingState.date}
**Time**: ${meetingState.time}

Thank you! The time has been reserved in our calendar. Let us know if you'd like to reschedule.`;

        await deleteState(userId);
        return summary;
      } else {
        meetingState.step = "time";
        await redis.set(`meetingState:${userId}`, meetingState);
        return "❌ That time is already booked. Please choose a different time (HH:MM between 11:00 and 17:00).";
      }
    }

    // Chatbot fallback
    const topResults = await searchRelevantQA(userPrompt);
    const context = topResults
      .map((item, idx) => `Q${idx + 1}: ${item.question}\nA${idx + 1}: ${item.answer}`)
      .join("\n\n");

    const finalPrompt = CHATBOT_PROPMPT(context, userPrompt);
    const model = google("models/gemini-1.5-flash-latest");

    const maxRetries = 2;
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
    if (userPrompt !== "") {
      console.error("❌ Error in chatbot:", err);
      return "Sorry, something went wrong while answering your question. Please try again later.";
    }
  }
};

const deleteState = async (userId) => {
  await redis.del(`meetingState:${userId}`);
};
*/
import { redis } from "@/services/redis/index.js";
import { google } from "@/services/gemini/index.js";
import { generateText } from "ai";
import { searchRelevantQA } from "@/lib/embedding/fetchQueryEmbedding.js";
import { checkAvailability, addToDB } from '@/lib/checkAvailability/index.js';
import CHATBOT_PROPMPT from "@/lib/chatbot/Prompt.js";
import { createGoogleMeetEvent } from '@/lib/googleMeetHelper/createMeet.js';

const defaultState = {
  step: null,
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

// 🔍 Extract a specific field using Gemini
const extractFieldFromPrompt = async (field, userPrompt) => {
  const model = google("models/gemini-1.5-flash-latest");

  const fieldPrompt = `
Extract only the "${field}" from the following message:
"${userPrompt}"

Return only the "${field}" value as plain text with no extra words.of the date is in any form convert it in format of DD-MM-YYYY.if the time is in any format change it to HH:MM format.
If the value is invalid or unclear, just return "null".
`.trim();

  const result = await generateText({
    model,
    messages: [{ role: "user", content: fieldPrompt }],
  });

  const cleaned = result.text.trim().replace(/^```[\s\S]*?```$/, "").trim();

  if (cleaned.toLowerCase() === "null" || cleaned === "") {
    return null;
  }

  return cleaned;
};

export const handleUserQuestion = async (userPrompt, userId) => {
  try {
    const lowerPrompt = userPrompt.toLowerCase();
    let meetingState = await redis.get(`meetingState:${userId}`);
    if (!meetingState) {
      meetingState = { ...defaultState };
    }

    // Step 1: Detect initial request
    if (isMeetingRequest(lowerPrompt) && !meetingState.started) {
      meetingState.started = true;
      meetingState.step = "confirmation";
      await redis.set(`meetingState:${userId}`, meetingState);
      return MEETING_INITIAL_PROMPT;
    }

    // Step 2: Confirmation
    if (meetingState.started && meetingState.step === "confirmation") {
      if (lowerPrompt.includes("yes")) {
        meetingState.step = "name";
        await redis.set(`meetingState:${userId}`, meetingState);
        return "Please enter your full name. If you want to cancel, type 'No'.";
      } else {
        await deleteState(userId);
        return "Okay, no meeting will be scheduled.";
      }
    }

    // Step 3: Name
    if (meetingState.step === "name") {
      if (lowerPrompt.includes("no")) {
        await deleteState(userId);
        return "Okay, no meeting will be scheduled.";
      }

      const name = await extractFieldFromPrompt("name", userPrompt);
      if (!name || /\d/.test(name)) {
        return "❌ Please enter a valid name (letters only).";
      }

      meetingState.name = name;
      meetingState.step = "email";
      await redis.set(`meetingState:${userId}`, meetingState);
      return "Please enter your email address. If you want to cancel, type 'No'.";
    }

    // Step 4: Email
    if (meetingState.step === "email") {
      if (lowerPrompt.includes("no")) {
        await deleteState(userId);
        return "Okay, no meeting will be scheduled.";
      }

      // Check for Slack email format
      let slackMatch = userPrompt.match(/<mailto:[^|]+\|([^>]+)>/);
      let rawInput = slackMatch?.[1] || userPrompt;

      const email = await extractFieldFromPrompt("email", rawInput);
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return "❌ Please enter a valid email address.";
      }

      meetingState.email = email;
      meetingState.step = "date";
      await redis.set(`meetingState:${userId}`, meetingState);
      return "Please enter the meeting date (format: DD-MM-YYYY).";
    }

    // Step 5: Date
    if (meetingState.step === "date") {
      if (lowerPrompt.includes("no")) {
        await deleteState(userId);
        return "Okay, no meeting will be scheduled.";
      }

      const date = await extractFieldFromPrompt("date", userPrompt);
      if (!date /*|| !/^\d{2}-\d{2}-\d{4}$/.test(date)*/) {
        return "❌ Please enter a valid date in DD-MM-YYYY format.";
      }

      meetingState.date = date;
      meetingState.step = "time";
      await redis.set(`meetingState:${userId}`, meetingState);
      return "Please enter the time for the meeting (HH:MM between 11:00 and 17:00).";
    }

    // Step 6: Time
    if (meetingState.step === "time") {
      if (lowerPrompt.includes("no")) {
        await deleteState(userId);
        return "Okay, no meeting will be scheduled.";
      }

      const time = await extractFieldFromPrompt("time", userPrompt);
      if (!time /*|| !/^([0-1]\d|2[0-3]):([0-5]\d)$/.test(time)*/) {
        return "❌ Please enter a valid time in HH:MM format (between 11:00 and 17:00).";
      }

      meetingState.time = time;

      const check = await checkAvailability(meetingState.time, meetingState.date);

      if (check.available) {
        await addToDB(
          meetingState.name,
          meetingState.email,
          meetingState.time,
          meetingState.date
        );

        try {
          await createGoogleMeetEvent({
            name: meetingState.name,
            email: meetingState.email,
            date: meetingState.date,
            time: meetingState.time,
          });
        } catch (calendarError) {
          console.error("Could not create calendar event, but data is saved in DB.", calendarError);
        }

        const summary = `✅ Meeting Scheduled!

**Name**: ${meetingState.name}
**Email**: ${meetingState.email}
**Date**: ${meetingState.date}
**Time**: ${meetingState.time}

Thank you! The time has been reserved in our calendar. Let us know if you'd like to reschedule.`;

        await deleteState(userId);
        return summary;
      } else {
        meetingState.step = "time";
        await redis.set(`meetingState:${userId}`, meetingState);
        return "❌ That time is already booked. Please choose a different time (HH:MM between 11:00 and 17:00).";
      }
    }

    // Fallback: General Chatbot QA
    const topResults = await searchRelevantQA(userPrompt);
    const context = topResults
      .map((item, idx) => `Q${idx + 1}: ${item.question}\nA${idx + 1}: ${item.answer}`)
      .join("\n\n");

    const finalPrompt = CHATBOT_PROPMPT(context, userPrompt);
    const model = google("models/gemini-1.5-flash-latest");

    const maxRetries = 2;
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
    if (userPrompt !== "") {
      console.error("❌ Error in chatbot:", err);
      return "Sorry, something went wrong while answering your question. Please try again later.";
    }
  }
};

const deleteState = async (userId) => {
  await redis.del(`meetingState:${userId}`);
};
