import axios from "axios";
import { redis } from "@/services/redis/index.js";

export const getGoogleTokens = async (email) => {
  const tokenData = await redis.get(`tokens:${email}`);
  if (!tokenData) throw new Error("No token found for user");

  let { access_token, refresh_token, expires_at } = JSON.parse(tokenData);

  if (Date.now() >= expires_at) {
    const response = await axios.post("https://oauth2.googleapis.com/token", {
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token,
      grant_type: "refresh_token",
    });

    access_token = response.data.access_token;
    expires_at = Date.now() + response.data.expires_in * 1000;

    await redis.set(`tokens:${email}`, JSON.stringify({ access_token, refresh_token, expires_at }));
  }

  return { access_token };
};
