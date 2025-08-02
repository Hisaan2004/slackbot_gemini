export default function handler(req, res) {
 // const redirectUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${process.env.GOOGLE_REDIRECT_URI}&scope=https://www.googleapis.com/auth/calendar.events&access_type=offline&prompt=consent`;
 //const redirectUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${process.env.GOOGLE_REDIRECT_URI}&scope=https://www.googleapis.com/auth/calendar.events&access_type=offline&prompt=consent&state=${req.query.email}`;
 const redirectUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
  `client_id=${process.env.GOOGLE_CLIENT_ID}` +
  `&redirect_uri=${process.env.REDIRECT_URI}` +
  `&response_type=code` +
  `&scope=${encodeURIComponent("https://www.googleapis.com/auth/calendar")}` +
  `&state=${meetingState.email}`; // 👈 You pass the email here
 res.redirect(redirectUrl);
}
/*export default function handler(req, res) {
  const userEmail = req.query.email; // email comes from Slack
  const redirectUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${process.env.GOOGLE_REDIRECT_URI}&scope=https://www.googleapis.com/auth/calendar.events&access_type=offline&prompt=consent&state=${userEmail}`;
  res.redirect(redirectUrl);
}*/