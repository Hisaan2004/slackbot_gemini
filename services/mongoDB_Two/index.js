import { MongoClient } from "mongodb";
import { CONFIG } from "@/config/index.js"; 
let cachedClient = null;
let cachedDb = null;

export async function connectToDB(name) {
  if (cachedDb) return cachedDb;

  try {
    cachedClient = new MongoClient(process.env.MONGO_URI_TWO);
    await cachedClient.connect();

    console.log("MongoDB connected");
    cachedDb = cachedClient.db(process.env.name);
    return cachedDb;
  } catch (error) {
    console.error("MongoDB connection failed", error);
    throw error;
  }
}
