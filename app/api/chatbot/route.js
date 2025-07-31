
import { redis } from "@/services/redis/index.js";
import { google } from "@/services/gemini/index.js";
import { generateText } from "ai";
import { searchRelevantQA } from "@/lib/embedding/fetchQueryEmbedding.js";
import {checkAvailability,addToDB} from '@/lib/checkAvailability/index.js'
import CHATBOT_PROPMPT from "@/lib/chatbot/Prompt.js";
/*let meetingState = {
  step: null,      
  name: null,
  email: null,
  date: null,
  time: null,
  started: false,
};*/
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

export const handleUserQuestion = async (userPrompt,userId) => {
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
        return "Please enter your full name.if you wanted to discontinue the process enter 'No'";
      } else if (lowerPrompt.includes("no")) {
     
        await redis.del(`meetingState:${userId}`);
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
      return "Please enter your email address.if you wanted to discontinue the process enter'No'";
    }

    if (meetingState.step === "email") {
       if (lowerPrompt.includes("no")) {
        await deleteState(userId);
        return "Okay, no meeting will be scheduled.";
      }
      meetingState.email = userPrompt;

      meetingState.step = "date";
      await redis.set(`meetingState:${userId}`, meetingState);
      return "Please enter the date for the meeting (format: DD-MM-YYYY).if you wanted to discontinue the process enter 'No'";
    }

    if (meetingState.step === "date") {
       if (lowerPrompt.includes("no")) {
        await deleteState(userId);
        return "Okay, no meeting will be scheduled.";
      }
      meetingState.date = userPrompt;
      meetingState.step = "time";
      await redis.set(`meetingState:${userId}`, meetingState);
      return "Please enter the time for the meeting between 11:00 and 17:00 (format: HH:MM).if you wanted to discontinue the process enter 'No'";
    }

   if (meetingState.step === "time") {
  meetingState.time = userPrompt;

 
  const check = await checkAvailability(meetingState.time, meetingState.date);

  if (check.available) {
 
    await addToDB(
      meetingState.name,
      meetingState.email,
      meetingState.time,
      meetingState.date
    );

    const summary = `
✅ Meeting Scheduled!

**Name**: ${meetingState.name}  
**Email**: ${meetingState.email}  
**Date**: ${meetingState.date}  
**Time**: ${meetingState.time}  
**Google Meet Link**: https://meet.google.com/bot-ified-meeting  

Let us know if you'd like to reschedule.`;
deleteState(userId)
   
    return summary;
  } else {
    meetingState.step = "time"; 
    await redis.set(`meetingState:${userId}`, meetingState);
    return "❌ That time is already booked. Please choose a different time (HH:MM between 11:00 and 17:00).";
  }
}
    
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
    console.error("Error in chatbot:", err);
    return "Sorry, something went wrong while answering your question. Please try again later.";
  }
};
const deleteState = async (userId) => {
  await redis.del(`meetingState:${userId}`);
};
