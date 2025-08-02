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

