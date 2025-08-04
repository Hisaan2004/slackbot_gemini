import { redis } from "@/services/redis/index.js";
import { google } from "@/services/gemini/index.js";
import { generateText } from "ai";
import { searchRelevantQA } from "@/lib/embedding/fetchQueryEmbedding.js";
import { checkAvailability, addToDB } from '@/lib/checkAvailability/index.js';
import CHATBOT_PROPMPT from "@/lib/chatbot/Prompt.js";
import { createGoogleMeetEvent } from '@/lib/googleMeetHelper/createMeet.js';
import { isvalidateDateTime } from "@/lib/dateHelper/pastDateTime.js";
import CHECKINFOPROMPT from "@/lib/chatbot/Prompt.js";

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

const MEETING_INITIAL_PROMPT = "Would you like to schedule a meeting with our representative? Please reply with 'Yes' or 'No'.";

const extractFieldFromPrompt = async (field, userPrompt) => {
  const model = google("models/gemini-1.5-flash-latest");

  const prompt =CHECKINFOPROMPT(field, userPrompt);/* `
Extract only the "${field}" from this message:
"${userPrompt}"

If it's a date, return in format DD-MM-YYYY and make sure the date is not satuday or sunday.
If it's time, return in HH:MM (24h) and make sure the time is from 11am to 5pm.
If it's invalid or unclear, return only "null".
No explanation, just the value.
`.trim();*/

  const result = await generateText({
    model,
    messages: [{ role: "user", content: prompt }],
  });

  const text = result.text.trim().replace(/^```[\s\S]*?```$/, "").trim();
  return text.toLowerCase() === "null" || !text ? null : text;
};

export const handleUserQuestion = async (userPrompt, userId) => {
  try {
    const lowerPrompt = userPrompt.toLowerCase();
    let meetingState = await redis.get(`meetingState:${userId}`);
    if (!meetingState) meetingState = { ...defaultState };

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
        return "Great! What's your full name? (Type 'No' to cancel)";
      } else {
        await deleteState(userId);
        return "No worries. Meeting scheduling canceled.";
      }
    }

    if (meetingState.step === "name") {
      if (lowerPrompt.includes("no")) {
        await deleteState(userId);
        return "Okay, the meeting won't be scheduled.";
      }

      const name = await extractFieldFromPrompt("name", userPrompt);
      if (!name || /\d/.test(name)) {
        return "❌ Please enter a valid name using letters only.";
      }

      meetingState.name = name;
      meetingState.step = "email";
      await redis.set(`meetingState:${userId}`, meetingState);
      return "Thanks! Now enter your email address.";
    }

    if (meetingState.step === "email") {
      if (lowerPrompt.includes("no")) {
        await deleteState(userId);
        return "Okay, the meeting won't be scheduled.";
      }

      const slackMatch = userPrompt.match(/<mailto:[^|]+\|([^>]+)>/);
      const rawInput = slackMatch?.[1] || userPrompt;
      const email = await extractFieldFromPrompt("email", rawInput);

      const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !validEmail.test(email)) {
        return "❌ Please enter a valid email address.";
      }

      meetingState.email = email;
      meetingState.step = "date";
      await redis.set(`meetingState:${userId}`, meetingState);
      return "Please provide a meeting date (DD-MM-YYYY).";
    }

    if (meetingState.step === "date") {
      if (lowerPrompt.includes("no")) {
        await deleteState(userId);
        return "Meeting scheduling canceled.";
      }

      const date = await extractFieldFromPrompt("date", userPrompt);
      if (!date||!/^\d{2}-\d{2}-\d{4}$/.test(date)) {
        return "❌ Invalid date. Please enter in DD-MM-YYYY format.";
      }

      meetingState.date = date;
      meetingState.step = "time";
      await redis.set(`meetingState:${userId}`, meetingState);
      return "Now enter the meeting time (HH:MM between 11:00 and 17:00).";
    }

    if (meetingState.step === "time") {
      if (lowerPrompt.includes("no")) {
        await deleteState(userId);
        return "Meeting canceled.";
      }

      const time = await extractFieldFromPrompt("time", userPrompt);
      if (!time||!/^\d{2}:\d{2}$/.test(time)) {
        return "❌ Invalid time. Please enter in HH:MM (24h).";
      }

      /*if (!isFutureDateTime(meetingState.date, time)) {
        meetingState.step = "date"; // restart from date
          meetingState.time = null;  // ✅ FIX: clear old invalid time
  await redis.set(`meetingState:${userId}`, meetingState);
        return "❌ You can't choose a past date/time. Please enter a new date (DD-MM-YYYY).";
      }*/
     if (!isvalidateDateTime(meetingState.date, time)) {
      meetingState.step = "date"; // restart from date
      meetingState.time = null;
      await redis.set(`meetingState:${userId}`, meetingState);
      return "❌ Invalid time. Please select a **weekday** between **11:00 AM and 5:00 PM (PKT)**.";
    }

      meetingState.time = time;

      const check = await checkAvailability(time, meetingState.date);

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
        } catch (err) {
          console.error("Google Calendar error. Meeting saved without event:", err);
        }

        await deleteState(userId);
        return `✅ **Meeting Scheduled!**

**Name**: ${meetingState.name}  
**Email**: ${meetingState.email}  
**Date**: ${meetingState.date}  
**Time**: ${meetingState.time}  

Thank you! Your meeting is scheduled. Let us know if you'd like to reschedule.`;
      } else {
        return "❌ That time is already booked. Please enter a different time between 11:00 and 17:00.";
      }
    }

    const topResults = await searchRelevantQA(userPrompt);
    const context = topResults
      .map((item, i) => `Q${i + 1}: ${item.question}\nA${i + 1}: ${item.answer}`)
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
    console.error("❌ Chatbot error:", err);
    return "An error occurred. Please try again later.";
  }
};

const deleteState = async (userId) => {
  await redis.del(`meetingState:${userId}`);
};
