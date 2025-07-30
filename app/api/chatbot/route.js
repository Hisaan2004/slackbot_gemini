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
import { google } from "@/services/gemini/index.js";
import { generateText } from "ai";
import { searchRelevantQA } from "@/lib/embedding/fetchQueryEmbedding.js";
import CHATBOT_PROPMPT from "@/lib/chatbot/Prompt.js";

const MEETING_INITIAL_PROMPT = "Do you want to schedule a meeting with our representative? Answer with yes or no.";

const isMeetingRequest = (input) => {
  const keywords = ["meeting", "schedule", "appointment", "meet"];
  return keywords.some((kw) => input.toLowerCase().includes(kw));
};

const MEETING_FLOW_PROMPT = (context, userPrompt) => {
  return `You are a meeting assistant. Guide the user to set up a meeting by collecting:
1. Name
2. Email
3. Date
4. Time

After collecting this information, respond with a summary and a Google Meet link hosted by 'Botified'.

User said: ${userPrompt}
Context: ${context || "N/A"}`;
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

    // Step 3: If both flags are true → Proceed with meeting flow
    const hasRequested = meetingHistory.includes("meeting-requested");
    const hasConfirmed = meetingHistory.includes("user-confirmed");

    if (hasRequested && hasConfirmed) {
      const prompt = MEETING_FLOW_PROMPT("", "Let's start scheduling your meeting.");
      const model = google("models/gemini-1.5-flash-latest");

      const result = await generateText({
        model,
        messages: [{ role: "user", content: prompt }],
      });

      meetingHistory = []; // clear after meeting prompt is done
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
};
