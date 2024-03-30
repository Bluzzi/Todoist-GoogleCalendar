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
  client.setCredentials({ refresh_token: googleUser.token });

  // Try to refresh access token and save it:
  const { credentials } = await client.refreshAccessToken();
  await db.googleUser.update({ where: { email }, data: { token: credentials.refresh_token! } });
  client.setCredentials(credentials);

  return client;
};

const getCalendars = async(email: string): Promise<calendar_v3.Schema$CalendarListEntry[]> => {
  const api = calendar({ version: "v3", auth: await client(email) });

  return (await api.calendarList.list()).data.items!;
};

const getEvents = async(email: string, minDate?: Day, maxDate?: Day): Promise<calendar_v3.Schema$Event[]> => {
  const api = calendar({ version: "v3", auth: await client(email) });
  const calendars = await getCalendars(email);

  const events: calendar_v3.Schema$Event[] = [];

  for (const cal of calendars) {
    const response = await api.events.list({
      calendarId: cal.id!,
      singleEvents: true,
      timeMin: minDate?.toISOString(),
      timeMax: maxDate?.toISOString()
    });

    events.push(...response.data.items!);
  }

  return events;
};

const getEvent = async(email: string, id: string): Promise<calendar_v3.Schema$Event> => {
  const api = calendar({ version: "v3", auth: await client(email) });

  const response = await api.events.get({ eventId: id, calendarId: "primary" }); // TODO: not use primary

  return response.data;
};

export const google = { getCalendars, getEvents, getEvent };