import { MongoClient } from "mongodb";
import { CONFIG } from "@/config/index.js"; 
let cachedClient = null;
let cachedDb = null;

export async function connectToDB() {
  if (cachedDb) return cachedDb;

  try {
    cachedClient = new MongoClient(CONFIG.URI);
    await cachedClient.connect();

    console.log("MongoDB connected");
    cachedDb = cachedClient.db(CONFIG.DB_NAME);
    return cachedDb;
  } catch (error) {
    console.error("MongoDB connection failed", error);
    throw error;
  }
}
