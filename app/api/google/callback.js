/*import axios from 'axios';

export default async function handler(req, res) {
  const code = req.query.code;

  const response = await axios.post('https://oauth2.googleapis.com/token', {
    code,
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI,
    grant_type: 'authorization_code'
  });

  const { access_token, refresh_token } = response.data;

  // You’ll probably want to store this per-user in a DB
  // For now, we just return it
  res.status(200).json({ access_token, refresh_token });
}*//*
import axios from 'axios';
import { redis } from "@/services/redis/index.js"; // assuming you use Redis

export default async function handler(req, res) {
  const code = req.query.code;

  const response = await axios.post('https://oauth2.googleapis.com/token', {
    code,
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI,
    grant_type: 'authorization_code'
  });

  const { access_token, refresh_token, expires_in, id_token } = response.data;

  // OPTIONAL: Decode email from id_token if you want to associate user
  const payload = JSON.parse(Buffer.from(id_token.split('.')[1], 'base64').toString());
  const email = payload.email;

  // Store tokens using user email or Slack user ID
  await redis.set(`tokens:${email}`, JSON.stringify({
    access_token,
    refresh_token,
    expires_at: Date.now() + expires_in * 1000
  }));

  res.send("✅ Google access granted. You may now return to Slack and schedule a meeting.");
}
*/
// /api/auth/google/callback.js
/*
import axios from 'axios';
import { redis } from "@/services/redis/index.js";

export default async function handler(req, res) {
  const code = req.query.code;
  const emailFromState = req.query.state; // passed via redirect URL

  const response = await axios.post('https://oauth2.googleapis.com/token', {
    code,
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI,
    grant_type: 'authorization_code'
  });

  const { access_token, refresh_token, expires_in, id_token } = response.data;

  // Decode Google email
  const payload = JSON.parse(Buffer.from(id_token.split('.')[1], 'base64').toString());
  const googleEmail = payload.email.toLowerCase();

  const email = emailFromState?.toLowerCase() || googleEmail;

  // Store token
  await redis.set(`tokens:${email}`, JSON.stringify({
    access_token,
    refresh_token,
    expires_at: Date.now() + expires_in * 1000
  }));

  res.send("✅ Google access granted. You may now return to Slack and schedule a meeting.");
}
*//*
import axios from 'axios';
import { redis } from "@/services/redis/index.js";

export default async function handler(req, res) {
  const code = req.query.code;
  const emailFromState = req.query.state; // email passed via redirect

  const response = await axios.post('https://oauth2.googleapis.com/token', {
    code,
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI,
    grant_type: 'authorization_code'
  });

  const { access_token, refresh_token, expires_in, id_token } = response.data;

  // Decode Google email
  const payload = JSON.parse(Buffer.from(id_token.split('.')[1], 'base64').toString());
  const googleEmail = payload.email.toLowerCase();

  // Use either the Slack-provided email from state OR Google email
  const email = (emailFromState || googleEmail).toLowerCase();

  // ✅ Store token by email in Redis
  await redis.set(`tokens:${email}`, JSON.stringify({
    access_token,
    refresh_token,
    expires_at: Date.now() + expires_in * 1000
  }));

  res.send("✅ Google access granted. You may now return to Slack and schedule a meeting.");
}
*/
/*
import axios from 'axios';
import { redis } from "@/services/redis/index.js";

export default async function handler(req, res) {
  try {
    const { code, state: emailFromState } = req.query;

    if (!code) {
      return res.status(400).send("Missing authorization code.");
    }

    const response = await axios.post('https://oauth2.googleapis.com/token', {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code'
    });

    const { access_token, refresh_token, expires_in, id_token } = response.data;

    if (!id_token) {
      return res.status(500).send("No ID token returned from Google.");
    }

    // Decode email from id_token
    const payload = JSON.parse(
      Buffer.from(id_token.split('.')[1], 'base64').toString()
    );
    const googleEmail = payload.email?.toLowerCase();

    if (!googleEmail) {
      return res.status(500).send("Could not extract email from Google ID token.");
    }

    // Final email: either passed from state or from Google account
    const email = (emailFromState || googleEmail).toLowerCase();

    if (!email) {
      return res.status(500).send("Email not found for token storage.");
    }

    // ✅ Store tokens in Redis with a namespaced key
    await redis.set(`tokens:${email}`, JSON.stringify({
      access_token,
      refresh_token,
      expires_at: Date.now() + expires_in * 1000
    }));

    console.log(`✅ Token stored in Redis for: tokens:${email}`);

    res.send("✅ Google access granted. You may now return to Slack and schedule a meeting.");
  } catch (error) {
    console.error("❌ OAuth callback error:", error?.response?.data || error.message);
    res.status(500).send("Google authorization failed. Please try again.");
  }
}
*/
/*export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state"); // 👈 This contains the email you passed earlier

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.REDIRECT_URI,
      code,
      grant_type: "authorization_code",
    }),
  });
*/
 /* const { access_token, refresh_token, id_token } = await tokenResponse.json();

  const payload = JSON.parse(Buffer.from(id_token.split('.')[1], 'base64').toString());
  const googleEmail = payload.email;

  const email = (state || googleEmail).toLowerCase(); // ✅ Use the one passed via Slack

  await redis.set(
    `tokens:${email}`,
    JSON.stringify({ access_token, refresh_token }),
  );

  return Response.redirect("https://slack.com/app_redirect_page");
}*//*
const { access_token, refresh_token, id_token, expires_in } = await tokenResponse.json();

const payload = JSON.parse(Buffer.from(id_token.split('.')[1], 'base64').toString());
const googleEmail = payload.email;

const email = (state || googleEmail).toLowerCase();

await redis.set(
  `tokens:${email}`,
  JSON.stringify({
    access_token,
    refresh_token,
    expires_at: Date.now() + expires_in * 1000 // ✅ This is crucial!
  })
);
}*/

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  // Logging the incoming values
  console.log("🔑 Received code:", code);
  console.log("📩 Received state (email):", state);

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.REDIRECT_URI,
      code,
      grant_type: "authorization_code",
    }),
  });

  const {
    access_token,
    refresh_token,
    id_token,
    expires_in
  } = await tokenResponse.json();

  if (!access_token || !refresh_token || !id_token) {
    console.error("❌ Missing token fields in response");
    return new Response("Token exchange failed", { status: 400 });
  }

  const payload = JSON.parse(Buffer.from(id_token.split('.')[1], 'base64').toString());
  const googleEmail = payload.email;
  const email = (state || googleEmail).toLowerCase();

  const redisKey = `tokens:${email}`;
  const tokenData = {
    access_token,
    refresh_token,
    expires_at: Date.now() + expires_in * 1000
  };

  await redis.set(redisKey, JSON.stringify(tokenData));
  console.log("✅ Saved token to Redis under key:", redisKey);

  // Optional: confirm it was saved
  const confirm = await redis.get(redisKey);
  console.log("🔍 Redis check after set:", confirm);

  return new Response("Token saved successfully", { status: 200 });
}
