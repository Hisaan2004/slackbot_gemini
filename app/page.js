'use client';
/*import Image from "next/image";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Image
          className={styles.logo}
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        <ol>
          <li>
            Get started by editing <code>app/page.js</code>.
          </li>
          <li>Save and see your changes instantly.</li>
        </ol>

        <div className={styles.ctas}>
          <a
            className={styles.primary}
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className={styles.logo}
              src="/vercel.svg"
              alt="Vercel logomark"
              width={20}
              height={20}
            />
            Deploy now
          </a>
          <a
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.secondary}
          >
            Read our docs
          </a>
        </div>
      </main>
      <footer className={styles.footer}>
        <a
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}
*//*
import { connectToDB } from '../../app/service/mongodb/index.js';
import { CONFIG } from "../../config/index.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

import { index } from '../../app/service/pinecone/index.js';

// Access your API key as an environment variable (see "Set up your API key" below)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function getEmbeddings(text) {
  try {
    const model = genAI.getGenerativeModel({ model: "embedding-001"});
    const result = await model.embedContent(text);
    const embedding = result.embedding;
    return embedding.values;
  } catch (err) {
    console.error("Embedding error:", err);
    return null; // Return null to indicate failure
  }
}

async function processData() {
  try {
    const db = await connectToDB();
    const collection = db.collection(CONFIG.QA_COLLECTION_NAME);

    const documents = await collection.find({}).toArray();
    console.log(` Fetched ${documents.length} documents from MongoDB`);

    for (const doc of documents) {
      const url = doc.url;
      const qas = doc.qa || [];

      for (let i = 0; i < qas.length; i++) {
        console.log(` Processing Q/A for URL: ${url}\n`);

        const qaText = `Q: ${qas[i].question}\nA: ${qas[i].answer}`;
        const embedding = await getEmbeddings(qaText);

        if (!embedding) {
          console.warn(" Skipping due to embedding failure.");
          continue;
        }

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

        console.log(` Upserted: ${qas[i].question}`);
      }
    }

    console.log(" All documents processed.");
  } catch (err) {
    console.error(" Error in processData:", err.message);
  }
}

processData();*/
"use client"; // if you're using App Router
import { useState } from "react";

export default function Home() {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/embedding", {
        method: "POST", // use POST if processing data
      });

      const data = await res.json();
      console.log("Response:", data);
    } catch (err) {
      console.error("API call failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        className="text-black bg-white rounded p-2"
        onClick={handleClick}
        disabled={loading}
      >
        {loading ? "Processing..." : "Click Me"}
      </button>
    </div>
  );
}
