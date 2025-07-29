// File: pages/api/embedding/index.js
import { connectToDB } from "@/services/mongodb/index.js";
import { CONFIG } from "@/config/index.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { index } from "@/services/pinecone/index.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function getEmbeddings(text) {
  try {
    const model = genAI.getGenerativeModel({ model: "embedding-001" });
    const result = await model.embedContent(text);
    const embedding = result.embedding;
    return embedding.values;
  } catch (err) {
    console.error("Embedding error:", err);
    return null;
  }
}

export async function POST(req) {
  try {
    const db = await connectToDB();
    const collection = db.collection(CONFIG.QA_COLLECTION_NAME);

    const documents = await collection.find({}).toArray();
    console.log(`Fetched ${documents.length} documents`);

    for (const doc of documents) {
      const url = doc.url;
      const qas = doc.qa || [];

      for (let i = 0; i < qas.length; i++) {
        const qaText = `Q: ${qas[i].question}\nA: ${qas[i].answer}`;
        const embedding = await getEmbeddings(qaText);

        if (!embedding) continue;

        await index.upsert([
          {
            id: `${doc._id}_${i}`,
            values: embedding,
            metadata: {
              url,
              question: qas[i].question,
              answer: qas[i].answer,
            },
          },
        ]);
      }
    }

    return Response.json({ message: "All documents processed successfully." });
  } catch (error) {
    console.error("Error in handler:", error.message);
    return new Response(JSON.stringify({ message: "Server error", error: error.message }), {
      status: 500,
    });
  }
}
