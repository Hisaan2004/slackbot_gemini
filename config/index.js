//import { EmbedRequestFromJSON } from "@pinecone-database/pinecone/dist/pinecone-generated-ts-fetch/inference";

export const MONGODB_DB = process.env.MONGODB_DB;
export const MONGODB_URI = process.env.MONGODB_URI;
export const GOOGLE_API=process.env.GOOGLE_API_KEY;
export const GEMINI_API=process.env.GEMINI_API_KEY;
export const GEMINI_TWO_API=process.env.GOOGLE_TWO_API
export const EMBEDD_API=process.env.EMBEDD_API;
export const PINECONE_API_KEY=process.env.PINECONE_API;
export const PINE_HOST=process.env.PINECONE_HOST;
export const PINE_INDEX=process.env.PINECONE_INDEX_NAME;
export const GOOGLE_THREE_API=process.env.GOOGLE_THREE_API;
 if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not set in the .env file");
}
if (!MONGODB_DB) {
  throw new Error("MONGODB_DB is not set in the .env file");
}
if (!GOOGLE_API) {
  throw new Error("Gemini api is not set in the .env file");
}
export const CONFIG = {
  URI: MONGODB_URI,
  DB_NAME: MONGODB_DB,
  COLLECTION_NAME: "pages",
  API_KEY:GOOGLE_API,
  QA_COLLECTION_NAME:"QAnswer",
  API_TWO_KEY:GEMINI_API,
  API_THREE_KEY:GEMINI_TWO_API,
  EMBEDD_API_KEY:EMBEDD_API,
  PINECONE_HOST:PINE_HOST,
  PINECONE_INDEX:PINE_INDEX,
  PINECONE_API:PINECONE_API_KEY,
  API_FOUR_KEY:GOOGLE_THREE_API,
};