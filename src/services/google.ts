import type { calendar_v3 } from "@googleapis/calendar";
import type { Day } from "#/utils/day";
import { db } from "#/utils/db";
import { env } from "#/utils/env";
import { calendar } from "@googleapis/calendar";
import { OAuth2Client } from "google-auth-library";

const client = async(email: string): Promise<OAuth2Client> => {
  // Get curremt user data:
  const googleUser = await db.googleUser.findUnique({ where: { email } });
  if (!googleUser) throw Error("This email does not exist.");

  // Create client with the current user data:
  const client = new OAuth2Client(env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET);
  client.setCredentials({ refresh_token: googleUser.refreshToken });

  // Try to refresh access token and save it:
  const { credentials } = await client.refreshAccessToken();
  await db.googleUser.update({ where: { email }, data: { refreshToken: credentials.refresh_token! } });
  client.setCredentials(credentials);

  return client;
};

const getCalendars = async(email: string): Promise<calendar_v3.Schema$CalendarListEntry[]> => {
  const api = calendar({ version: "v3", auth: await client(email) });

  return (await api.calendarList.list()).data.items!;
};

type CalendarEvent = calendar_v3.Schema$Event & { calendarId: string };

const getEvents = async(email: string, minDate?: Day, maxDate?: Day): Promise<CalendarEvent[]> => {
  const api = calendar({ version: "v3", auth: await client(email) });
  const calendars = await getCalendars(email);

  const events: CalendarEvent[] = [];

  for (const cal of calendars) {
    const response = await api.events.list({
      calendarId: cal.id!,
      singleEvents: true,
      timeMin: minDate?.toISOString(),
      timeMax: maxDate?.toISOString()
    });

    events.push(...response.data.items!.map(event => ({ ...event, calendarId: cal.id! })));
  }

  return events;
};

const getEvent = async(email: string, calendarID: string, eventID: string): Promise<CalendarEvent> => {
  const api = calendar({ version: "v3", auth: await client(email) });

  const response = await api.events.get({ calendarId: calendarID, eventId: eventID });

  return { ...response.data, calendarId: calendarID };
};

export const google = { getCalendars, getEvents, getEvent };