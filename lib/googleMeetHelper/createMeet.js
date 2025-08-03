/*import axios from 'axios';
import { format } from 'date-fns'; // for formatting ISO datetime strings

const createGoogleMeetEvent = async (meetingState) => {
  const { access_token } = await getGoogleTokens(); // TODO: get access token from your DB or session
  const startDateTime = formatToISO(meetingState.date, meetingState.time);
  const endDateTime = addOneHour(startDateTime);

  const event = {
    summary: `Meeting with ${meetingState.name}`,
    start: {
      dateTime: startDateTime,
      timeZone: 'Asia/Karachi',
    },
    end: {
      dateTime: endDateTime,
      timeZone: 'Asia/Karachi',
    },
    conferenceData: {
      createRequest: {
        requestId: Math.random().toString(36).substring(2),
      },
    },
  };

  const response = await axios.post(
    'https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1',
    event,
    {
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  return response.data.hangoutLink;
};
const formatToISO = (dateStr, timeStr) => {
  const [day, month, year] = dateStr.split('-');
  return `${year}-${month}-${day}T${timeStr}:00+05:00`;
};

const addOneHour = (isoDateTime) => {
  const date = new Date(isoDateTime);
  date.setHours(date.getHours() + 1);
  return date.toISOString().replace('.000Z', '+05:00');
};*//*
import axios from 'axios';
import { format } from 'date-fns';
import { getGoogleTokens } from './getGoogleToken.js'; // 👈

export const createGoogleMeetEvent = async (meetingState) => {
  const { access_token } = await getGoogleTokens(meetingState.email); // use user’s email
  const startDateTime = formatToISO(meetingState.date, meetingState.time);
  const endDateTime = addOneHour(startDateTime);

  const event = {
    summary: `Meeting with ${meetingState.name}`,
    start: {
      dateTime: startDateTime,
      timeZone: 'Asia/Karachi',
    },
    end: {
      dateTime: endDateTime,
      timeZone: 'Asia/Karachi',
    },
    conferenceData: {
      createRequest: {
        requestId: Math.random().toString(36).substring(2),
      },
    },
  };

  const response = await axios.post(
    'https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1',
    event,
    {
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  return response.data.hangoutLink;
};

const formatToISO = (dateStr, timeStr) => {
  const [day, month, year] = dateStr.split('-');
  return `${year}-${month}-${day}T${timeStr}:00+05:00`;
};

const addOneHour = (isoDateTime) => {
  const date = new Date(isoDateTime);
  date.setHours(date.getHours() + 1);
  return date.toISOString().replace('.000Z', '+05:00');
};*//*
import { redis } from "@/services/redis";
import { google } from "googleapis";

export async function POST(req) {
  const { email, summary, date, time } = await req.json();

  const tokenData = await redis.get(`tokens:${email}`);
  if (!tokenData) {
    return new Response("No tokens found for this email. Please authenticate first.", { status: 401 });
  }

  const { access_token } = JSON.parse(tokenData);

  const calendar = google.calendar("v3");
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token });

  const event = {
    summary,
    start: { dateTime: `${date}T${time}:00`, timeZone: "Asia/Karachi" },
    end: { dateTime: `${date}T${time.slice(0, 2) * 1 + 1}:00:00`, timeZone: "Asia/Karachi" },
  };

  const response = await calendar.events.insert({
    auth,
    calendarId: "primary",
    requestBody: event,
  });

  return new Response(JSON.stringify({ meetLink: response.data.hangoutLink }), {
    headers: { "Content-Type": "application/json" },
  });
}

*/
// lib/googleMeetHelper/createMeet.js
/*
import { google } from "googleapis";
import { redis } from "@/services/redis";

export const createGoogleMeetEvent = async ({ name, email, date, time }) => {
  const tokenData = await redis.get(`tokens:${email}`);
  if (!tokenData) {
    throw new Error(`🔒 User ${email} is not authenticated. Run /auth/redirect?email=...`);
  }

  const { access_token } = JSON.parse(tokenData);

  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token });

  const calendar = google.calendar({ version: "v3", auth });

  const event = {
    summary: `Meeting with ${name}`,
    start: {
      dateTime: `${date}T${time}:00`,
      timeZone: "Asia/Karachi",
    },
    end: {
  dateTime: `${date}T${String(parseInt(time.slice(0, 2)) + 1).padStart(2, "0")}:${time.slice(3)}:00`,
  timeZone: "Asia/Karachi",
},
    conferenceData: {
      createRequest: {
        requestId: `${Date.now()}`,
        conferenceSolutionKey: { type: "hangoutsMeet" },
      },
    },
  };

  const response = await calendar.events.insert({
    calendarId: "primary",
    requestBody: event,
    conferenceDataVersion: 1,
  });

  return response.data.hangoutLink;
};
*/
// src/lib/googleMeetHelper/createMeet.js
/*
import { google } from 'googleapis';
import path from 'path';

// --- CONFIGURATION ---
// 1. UPDATE THIS PATH: It should point to your JSON key file.
const KEYFILEPATH = path.join(process.cwd(), 'secret_key.json');

// 2. UPDATE YOUR CALENDAR ID: 
//    - For your primary calendar, use 'primary'.
//    - For a secondary calendar, find its ID in the calendar's "Settings and sharing" page under "Integrate calendar".
const CALENDAR_ID = 'primary'; 
// --- END CONFIGURATION ---


const SCOPES = ['https://www.googleapis.com/auth/calendar'];

const auth = new google.auth.GoogleAuth({
    keyFile: KEYFILEPATH,
    scopes: SCOPES,
});

const calendar = google.calendar({ version: 'v3', auth });

// Helper function to create a proper Date object from "DD-MM-YYYY" and "HH:MM"
const combineDateTime = (date, time) => {
    const [day, month, year] = date.split('-');
    const [hours, minutes] = time.split(':');
    // new Date(year, monthIndex, day, hours, minutes) - month is 0-indexed!
    return new Date(year, parseInt(month, 10) - 1, day, hours, minutes);
};

export const createGoogleMeetEvent = async ({ name, email, date, time }) => {
    try {
        const startTime = combineDateTime(date, time);
        // Set the meeting for 30 minutes by default
        const endTime = new Date(startTime.getTime() + 30 * 60000); 

        const event = {
            summary: `Meeting with ${name}`,
            description: 'This meeting was scheduled automatically by the Slack scheduling bot.',
            start: {
                dateTime: startTime.toISOString(),
                timeZone: 'UTC', // It's best practice to use UTC on the backend
            },
            end: {
                dateTime: endTime.toISOString(),
                timeZone: 'UTC',
            },
            // Add attendees to the event
            attendees: [{ email: email }],
            // Add a Google Meet link to the event
            conferenceData: {
                createRequest: {
                    requestId: `meeting-${name}-${Date.now()}`,
                    conferenceSolutionKey: {
                        type: 'hangoutsMeet'
                    }
                }
            },
            reminders: {
                useDefault: false,
                overrides: [
                    { method: 'email', minutes: 24 * 60 }, // 1 day before
                    { method: 'popup', minutes: 15 },      // 15 minutes before
                ],
            },
        };

        const createdEvent = await calendar.events.insert({
            calendarId: CALENDAR_ID,
            resource: event,
            conferenceDataVersion: 1, // Required to generate a Google Meet link
            sendUpdates: 'all', // Notifies attendees
        });

        console.log('✅ Google Calendar event created:', createdEvent.data.htmlLink);
        return createdEvent.data;

    } catch (error) {
        console.error('❌ Error creating Google Calendar event:', error);
        // You might want to throw the error to be handled by the caller
        throw new Error('Failed to create Google Calendar event.');
    }
};*/
// src/lib/googleMeetHelper/createMeet.js

import { google } from 'googleapis';
import path from 'path';

// --- CONFIGURATION ---
const CALENDAR_ID = 'primary'; // Or your specific calendar ID
const SCOPES = ['https://www.googleapis.com/auth/calendar'];
// --- END CONFIGURATION ---

// This function dynamically gets the authentication credentials.
const getAuth = () => {
  // 1. Check for the environment variable (for Vercel/Production)
  if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY_BASE64) {
    console.log("Authenticating with Vercel environment variable.");
    
    // Decode the Base64 string back into the JSON key
    const decodedKey = Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT_KEY_BASE64, 'base64').toString('utf-8');
    const credentials = JSON.parse(decodedKey);

    // Use the credentials object directly for authentication
    return new google.auth.GoogleAuth({
      credentials,
      scopes: SCOPES,
    });
  } 
  // 2. Fallback to the local file (for local development)
  else {
    console.log("Authenticating with local key file.");
    const KEYFILEPATH = path.join(process.cwd(), 'secret_key.json'); // Make sure this filename matches yours
    
    return new google.auth.GoogleAuth({
      keyFile: KEYFILEPATH,
      scopes: SCOPES,
    });
  }
};


// Initialize auth and calendar objects
const auth = getAuth();
const calendar = google.calendar({ version: 'v3', auth });

// Helper function to create a proper Date object from "DD-MM-YYYY" and "HH:MM"
const combineDateTime = (date, time) => {
    const [day, month, year] = date.split('-');
    const [hours, minutes] = time.split(':');
    return new Date(year, parseInt(month, 10) - 1, day, hours, minutes);
};


// The rest of your function does not need to change
/*
export const createGoogleMeetEvent = async ({ name, email, date, time }) => {
    try {
        const startTime = combineDateTime(date, time);
        const endTime = new Date(startTime.getTime() + 30 * 60000); 
/*
        const event = {
            summary: `Meeting with ${name}`,
            description: 'This meeting was scheduled automatically by the Slack scheduling bot.',
            start: { dateTime: startTime.toISOString(), timeZone: 'UTC' },
            end: { dateTime: endTime.toISOString(), timeZone: 'UTC' },
            attendees: [{ email: email }],
            conferenceData: {
                createRequest: {
                    requestId: `meeting-${name}-${Date.now()}`,
                    conferenceSolutionKey: { type: 'hangoutsMeet' }
                }
            },
            reminders: {
                useDefault: false,
                overrides: [
                    { method: 'email', minutes: 24 * 60 },
                    { method: 'popup', minutes: 15 },
                ],
            },
        };

        const createdEvent = await calendar.events.insert({
            calendarId: CALENDAR_ID,
            resource: event,
            conferenceDataVersion: 1,
            sendUpdates: 'all',
        });
*/ /*const event = {
            summary: `Meeting with ${name}`,
            // Add the user's details to the description for your reference
            description: `This meeting was scheduled for:\nName: ${name}\nEmail: ${email}\n\nThis event was created automatically by the Slack scheduling bot.`,
            start: {
                dateTime: startTime.toISOString(),
                timeZone: 'UTC',
            },
            end: {
                dateTime: endTime.toISOString(),
                timeZone: 'UTC',
            },
            // The 'attendees' property has been REMOVED.
            
            // You can still create a Google Meet link for yourself.
            conferenceData: {
                createRequest: {
                    requestId: `meeting-${name}-${Date.now()}`,
                    conferenceSolutionKey: {
                        type: 'hangoutsMeet'
                    }
                }
            },
            reminders: {
                useDefault: false,
                overrides: [
                    { method: 'email', minutes: 24 * 60 },
                    { method: 'popup', minutes: 15 },
                ],
            },
        };

        const createdEvent = await calendar.events.insert({
            calendarId: CALENDAR_ID,
            resource: event,
            conferenceDataVersion: 1, 
            // Since there are no attendees, we don't need 'sendUpdates'
        });
        console.log('✅ Google Calendar event created:', createdEvent.data.htmlLink);
        return createdEvent.data;

    } catch (error) {
        console.error('❌ Error creating Google Calendar event:', error);
        throw new Error('Failed to create Google Calendar event.');
    }
};
*/
export const createGoogleMeetEvent = async ({ name, email, date, time }) => {
    try {
        const startTime = combineDateTime(date, time);
        const endTime = new Date(startTime.getTime() + 30 * 60000); 

        const event = {
            summary: `Meeting with ${name}`,
            description: `This meeting was scheduled for:\nName: ${name}\nEmail: ${email}\n\nThis event was created automatically by the Slack scheduling bot.`,
            start: {
                dateTime: startTime.toISOString(),
                timeZone: 'UTC',
            },
            end: {
                dateTime: endTime.toISOString(),
                timeZone: 'UTC',
            },
            reminders: {
                useDefault: false,
                overrides: [
                    { method: 'email', minutes: 24 * 60 },
                    { method: 'popup', minutes: 15 },
                ],
            },
            // The 'conferenceData' object has been temporarily removed for debugging.
            /*
            conferenceData: {
                createRequest: {
                    requestId: `meeting-${name}-${Date.now()}`,
                    conferenceSolutionKey: {
                        type: 'hangoutsMeet'
                    }
                }
            },
            */
        };

        const createdEvent = await calendar.events.insert({
            calendarId: CALENDAR_ID,
            resource: event,
            // The 'conferenceDataVersion' has been temporarily removed for debugging.
            // conferenceDataVersion: 1, 
        });

        console.log('✅ Google Calendar event created (without Meet link):', createdEvent.data.htmlLink);
        return createdEvent.data;

    } catch (error) {
        console.error('❌ Error creating Google Calendar event:', error);
        throw new Error('Failed to create Google Calendar event.');
    }
};