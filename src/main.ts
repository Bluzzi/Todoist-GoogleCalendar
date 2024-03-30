import { google } from "#/services/google";
import { todoist, todoistUtils } from "#/services/todoist";
import { day } from "#/utils/day";
import { db } from "#/utils/db";

const createNextEvents = async(email: string): Promise<void> => {
  const events = await google.getEvents(email, day(), day().add(7, "day"));

  for (const event of events) {
    const eventSync = await db.eventSync.findFirst({ where: { googleEventID: event.id! } });
    if (eventSync) continue;

    const task = await todoist.addTask({
      content: event.summary,
      description: `${event.hangoutLink || ""}\n\n${event.location || ""}\n\n${event.description || ""}`,
      label: (await todoistUtils.getCalendarLabel()).id,
      dueDatetime: day.utc(event.start?.dateTime),
      duration: day(event.end?.dateTime).diff(event.start?.dateTime, "minute"),
      durationUnit: "minute"
    });

    await db.eventSync.create({ data: {
      todoistID: task.id,

      googleUserEmail: email,

      googleCalendarID: event.calendarId,
      googleEventID: event.id!,
      googleLastUpdate: event.updated!
    } });
  }
};

void (async() => {
  const googleUsers = await db.googleUser.findMany();

  for (const user of googleUsers) {
    await createNextEvents(user.email);
  }
})();