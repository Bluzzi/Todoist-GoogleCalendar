import { auth, calendar } from "@googleapis/calendar";
import dayjs from "dayjs";

// camille-dugas-calendar@calendar-sync-414904.iam.gserviceaccount.com

const main = async(): Promise<void> => {
  const jsonClient = new auth.GoogleAuth({
    keyFilename: `${__dirname}/../.api-key.json`,
    scopes: ["https://www.googleapis.com/auth/calendar"]
  });

  const client = calendar({
    version: "v3",
    auth: jsonClient
  });

  const { data: calendars } = await client.calendarList.list({
    showHidden: false
  });
  const { data: events } = await client.events.list({
    calendarId: "<google email>",
    timeMin: dayjs().subtract(1, "day").toISOString(),
    maxResults: 10
  });

  console.log(calendars.items);
  console.log(events.items?.map(element => element.summary));
};

void main().then(() => process.exit());