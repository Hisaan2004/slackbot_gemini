/*export default function handler(req, res) {
 // const redirectUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${process.env.GOOGLE_REDIRECT_URI}&scope=https://www.googleapis.com/auth/calendar.events&access_type=offline&prompt=consent`;
 //const redirectUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${process.env.GOOGLE_REDIRECT_URI}&scope=https://www.googleapis.com/auth/calendar.events&access_type=offline&prompt=consent&state=${req.query.email}`;
 const redirectUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
  `client_id=${process.env.GOOGLE_CLIENT_ID}` +
  `&redirect_uri=${process.env.REDIRECT_URI}` +
  `&response_type=code` +
  `&scope=${encodeURIComponent("https://www.googleapis.com/auth/calendar")}` +
  `&state=${meetingState.email}`; // 👈 You pass the email here
 res.redirect(redirectUrl);
}*/
/*export default function handler(req, res) {
  const userEmail = req.query.email; // email comes from Slack
  const redirectUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${process.env.GOOGLE_REDIRECT_URI}&scope=https://www.googleapis.com/auth/calendar.events&access_type=offline&prompt=consent&state=${userEmail}`;
  res.redirect(redirectUrl);
}*//*
export default function handler(req, res) {
  const { email } = req.query;

  const redirectUrl =
    `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${process.env.GOOGLE_CLIENT_ID}` +
    `&redirect_uri=${process.env.REDIRECT_URI}` +
    `&response_type=code` +
    `&scope=${encodeURIComponent("https://www.googleapis.com/auth/calendar.events")}` +
    `&access_type=offline` +
    `&prompt=consent` +
    `&state=${email}`; // ← Send email to retrieve later

  res.redirect(redirectUrl);
}*/
// pages/api/auth/redirect.js
/*
export default function handler(req, res) {
  const email = req.query.email;

  if (!email) {
    return res.status(400).send("Missing email");
  }

  const redirectUrl =
    `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${process.env.GOOGLE_CLIENT_ID}` +
    `&redirect_uri=${process.env.REDIRECT_URI}` +
    `&response_type=code` +
    `&scope=${encodeURIComponent("https://www.googleapis.com/auth/calendar")}` +
    `&access_type=offline&prompt=consent` +
    `&state=${encodeURIComponent(email)}`; // 👈 You pass email in state

  res.redirect(redirectUrl);
}*/
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');

  if (!email) {
    return new Response("Missing 'email' query parameter.", { status: 400 });
  }

  // Construct the Google OAuth2 URL
  const redirectUrl =
    `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${process.env.GOOGLE_CLIENT_ID}` +
    `&redirect_uri=${process.env.REDIRECT_URI}` + // This is your callback URL
    `&response_type=code` +
    `&scope=${encodeURIComponent("https://www.googleapis.com/auth/calendar")}` +
    `&access_type=offline&prompt=consent` +
    `&state=${encodeURIComponent(email)}`; // We pass the email in the 'state' parameter

  // Use a Response object to perform the redirect
  return Response.redirect(redirectUrl);
}
