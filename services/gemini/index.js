import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { CONFIG } from '@/config/index.js'
export const google = createGoogleGenerativeAI({
  apiKey:CONFIG.API_THREE_KEY,//API_FOUR_KEY
});