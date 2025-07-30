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

export const handleUserQuestion = async (userPrompt) => {
  try {
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
