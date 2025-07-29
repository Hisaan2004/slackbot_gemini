// route.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import { index } from "@/service/pinecone/index"; // Adjust as needed
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
//const index = pinecone.Index("your-index-name"); // <-- Replace with your actual index name
/*
export async function searchRelevantQA(userMessage) {
  try {
    // Step 1: Embed the user's question using Gemini
    const model = genAI.getGenerativeModel({ model: "embedding-002" });

    const embeddingResult = await model.embedContent({
      content: userMessage,
      taskType: "retrieval_query",
    });

    const embedding = embeddingResult.embedding.values;

    // Step 2: Query Pinecone for top 10 similar entries
    const queryResult = await index.query({
      vector: embedding,
      topK: 10,
      includeMetadata: true,
    });

    // Step 3: Collect and return results
    const topResults = queryResult.matches.map((match, index) => {
      return `🔹 *${index + 1}*. ${match.metadata?.content || 'No content found'} (Score: ${match.score.toFixed(2)})`;
    });

    return topResults.join("\n\n");

  } catch (err) {
    console.error("Error in Pinecone search:", err);
    return "❌ Sorry, I couldn’t fetch related information right now.";
  }
}*/
export async function searchRelevantQA(userMessage) {
  try {
    const model = genAI.getGenerativeModel({ model: "embedding-002" });

    const embeddingResult = await model.embedContent({
      content: userMessage,
      taskType: "retrieval_query",
    });

    const embedding = embeddingResult.embedding.values;

    const queryResult = await index.query({
      vector: embedding,
      topK: 10,
      includeMetadata: true,
    });

    // ✅ FIXED: Return metadata with question & answer
    const topResults = queryResult.matches.map((match) => ({
      question: match.metadata?.question || "No question found",
      answer: match.metadata?.answer || "No answer found",
      score: match.score,
    }));

    return topResults;
  } catch (err) {
    console.error("Error in Pinecone search:", err);
    return [];
  }
}

