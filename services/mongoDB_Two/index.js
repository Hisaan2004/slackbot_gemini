import { MongoClient } from "mongodb";

let cachedClient = null;
let cachedDb = null;

export async function connectToDB(name) {
  if (cachedDb) return cachedDb;

  if (!process.env.MONGO_URI_TWO) {
    throw new Error("Missing MONGO_URI_TWO in environment variables.");
  }

  try {
    cachedClient = new MongoClient(process.env.MONGO_URI_TWO);
    await cachedClient.connect();

    console.log("MongoDB connected");
    cachedDb = cachedClient.db(name);
    return cachedDb;
  } catch (error) {
    console.error("MongoDB connection failed", error);
    throw error;
  }
}