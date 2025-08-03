
import { google } from 'googleapis';
import path from 'path';

const CALENDAR_ID = 'hisaan.sakhawat@gmail.com';
const SCOPES = ['https://www.googleapis.com/auth/calendar'];

const getAuth = () => {
  if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY_BASE64) {
    console.log("Authenticating with Vercel environment variable.");
    
    const decodedKey = Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT_KEY_BASE64, 'base64').toString('utf-8');
    const credentials = JSON.parse(decodedKey);

    return new google.auth.GoogleAuth({
      credentials,
      scopes: SCOPES,
    });
  } 
  else {
    console.log("Authenticating with local key file.");
    const KEYFILEPATH = path.join(process.cwd(), 'secret_key.json'); 
    
    return new google.auth.GoogleAuth({
      keyFile: KEYFILEPATH,
      scopes: SCOPES,
    });
  }
};


const auth = getAuth();
const calendar = google.calendar({ version: 'v3', auth });

const combineDateTime = (date, time) => {
    const [day, month, year] = date.split('-');
    const [hours, minutes] = time.split(':');
    return new Date(year, parseInt(month, 10) - 1, day, hours, minutes);
};

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
            
            conferenceData: {
                createRequest: {
                    requestId: `meeting-${name}-${Date.now()}`,
                    conferenceSolutionKey: {
                        type: 'hangoutsMeet'
                    }
                }
            },
            
        };

        const createdEvent = await calendar.events.insert({
            calendarId: CALENDAR_ID,
            resource: event,
            // The 'conferenceDataVersion' has been temporarily removed for debugging.
            //conferenceDataVersion: 1, 
        });

        console.log('✅ Google Calendar event created (without Meet link):', createdEvent.data.htmlLink);
        return createdEvent.data;

    } catch (error) {
        console.error('❌ Error creating Google Calendar event:', error);
        throw new Error('Failed to create Google Calendar event.');
    }
};