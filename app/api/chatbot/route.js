
/*import { redis } from "@/services/redis/index.js";
import { google } from "@/services/gemini/index.js";
import { generateText } from "ai";
import { searchRelevantQA } from "@/lib/embedding/fetchQueryEmbedding.js";
import {checkAvailability,addToDB} from '@/lib/checkAvailability/index.js'
import CHATBOT_PROPMPT from "@/lib/chatbot/Prompt.js";

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
      meetingState.email = userPrompt.trim();
//meetingState.email = userPrompt.trim();
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
const meetLink = generateMeetLink(userId);
    const summary = `
✅ Meeting Scheduled!

**Name**: ${meetingState.name}  
**Email**: ${meetingState.email}  
**Date**: ${meetingState.date}  
**Time**: ${meetingState.time}  
**Google Meet Link**: ${meetLink}  

Let us know if you'd like to reschedule.`;
await deleteState(userId)
   
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
const generateMeetLink = (userId) => {
  const randomPart = Math.random().toString(36).substring(2, 9);
  return `https://meet.google.com/${randomPart}-${userId.toString().slice(-3)}`;
};*/

import { redis } from "@/services/redis/index.js";
import { google } from "@/services/gemini/index.js";
import { generateText } from "ai";
import { searchRelevantQA } from "@/lib/embedding/fetchQueryEmbedding.js";
import { checkAvailability, addToDB } from '@/lib/checkAvailability/index.js';
import CHATBOT_PROPMPT from "@/lib/chatbot/Prompt.js";
import {createGoogleMeetEvent} from '@/lib/googleMeetHelper/createMeet.js'

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
    if (typeof userPrompt !== 'string' || userPrompt.trim() === "") {
        console.warn("handleUserQuestion called with an empty or invalid prompt.");
        return; // Exit silently
    }
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
        return "Please enter your full name. If you want to cancel, type 'No'.";
      } else if (lowerPrompt.includes("no")) {
        await deleteState(userId);
        return "Okay, no meeting will be scheduled.";
      }
      else{
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

   /* if (meetingState.step === "email") {
      if (lowerPrompt.includes("no")) {
        await deleteState(userId);
        return "Okay, no meeting will be scheduled.";
      }
      meetingState.email = userPrompt.trim();
      meetingState.step = "date";
      const cleanEmail = email.includes('|') ? email.split('|')[1].replace('>', '') : email;
      const authLink = `https://slackbot-gemini.vercel.app/api/google/auth?email=${cleanEmail}`;
    await redis.set(`meetingState:${userId}`, meetingState);
    return `✅ Now please [click here to authenticate with Google Calendar](${authLink}). Once done, enter the meeting date (format: DD-MM-YYYY).`;
    }*/
  /* if (meetingState.step === "email") {
    if (lowerPrompt.includes("no")) {
        await deleteState(userId);
        return "Okay, no meeting will be scheduled.";
    }
    
    meetingState.email = userPrompt.trim();
    meetingState.step = "date";
    
    // --- START OF CORRECTION ---

    // Use userPrompt, which contains the raw input from Slack.
    const rawEmailInput = userPrompt.trim();
    
    // This logic correctly handles Slack's "mailto" format.
    const cleanEmail = rawEmailInput.includes('|') 
        ? rawEmailInput.split('|')[1].replace('>', '') 
        : rawEmailInput;

    const authLink = `https://slackbot-gemini.vercel.app/api/google/auth?email=${encodeURIComponent(cleanEmail)}`;
    
    // --- END OF CORRECTION ---

    await redis.set(`meetingState:${userId}`, meetingState);
    return `✅ Now please [click here to authenticate with Google Calendar](${authLink}). Once done, enter the meeting date (format: DD-MM-YYYY).`;
}*/
if (meetingState.step === "email") {
    if (lowerPrompt.includes("no")) {
        await deleteState(userId);
        return "Okay, no meeting will be scheduled.";
    }

    const rawEmailInput = userPrompt.trim();
    const cleanEmail = rawEmailInput.includes('|')
        ? rawEmailInput.split('|')[1].replace('>', '')
        : rawEmailInput;

    // FIX #1: Always store and use lowercase email to avoid mismatches
    meetingState.email = cleanEmail.toLowerCase();
    
    // FIX #2: Change the step and the prompt to wait for confirmation
    meetingState.step = "awaiting_auth_confirmation"; // A new step
    
    const authLink = `https://slackbot-gemini.vercel.app/api/google/auth?email=${encodeURIComponent(meetingState.email)}`;

    await redis.set(`meetingState:${userId}`, meetingState);
    
    // NEW PROMPT
    return `✅ I have your email. Now, please [click here to authenticate with Google Calendar](${authLink}).\n\nAfter you have successfully authenticated, please type **"done"** to continue.`;
}

// NEW STEP HANDLER to wait for the user's confirmation
if (meetingState.step === "awaiting_auth_confirmation") {
    if (lowerPrompt.trim() === "done") {
        meetingState.step = "date";
        await redis.set(`meetingState:${userId}`, meetingState);
        return "Great! Authentication confirmed. Please enter the meeting date (format: DD-MM-YYYY).";
    } else {
        // Remind the user what to do if they type something else
        return 'Please finish the authentication and type **"done"** to proceed.';
    }
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

        //const meetLink = generateMeetLink(userId);
        //const meetLink = await createGoogleMeetEvent(meetingState);
        const meetLink = await createGoogleMeetEvent(meetingState).catch((err) => {
  if (err.message.includes("not authenticated")) {
    return `🔒 Please authenticate first by visiting: https://yourdomain.com/api/auth/redirect?email=${meetingState.email}`;
  }
  throw err;
});
        const summary = `✅ Meeting Scheduled!

**Name**: ${meetingState.name}  
**Email**: ${meetingState.email}  
**Date**: ${meetingState.date}  
**Time**: ${meetingState.time}  
**Google Meet Link**: ${meetLink}  

Let us know if you'd like to reschedule.`;

        await deleteState(userId);
        return summary; // ✅ EARLY RETURN to avoid falling through
      } else {
        meetingState.step = "time";
        await redis.set(`meetingState:${userId}`, meetingState);
        return "❌ That time is already booked. Please choose a different time (HH:MM between 11:00 and 17:00).";
      }
    }

    // 🧠 Chatbot fallback (when not in meeting flow)
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
    if(userPrompt!=""){
    console.error("❌ Error in chatbot:", err);
    return "Sorry, something went wrong while answering your question. Please try again later.";
  }
}
};

const deleteState = async (userId) => {
  await redis.del(`meetingState:${userId}`);
};

/*const generateMeetLink = (userId) => {
  const randomPart = Math.random().toString(36).substring(2, 9);
  return `https://meet.google.com/${randomPart}-${userId.toString().slice(-3)}`;
};*/