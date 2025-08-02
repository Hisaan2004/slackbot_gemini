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
};*/
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


