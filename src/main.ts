import { google } from "#/services/google";
import { todoist, todoistUtils } from "#/services/todoist";
import { logger } from "#/utils/logger";
import { day } from "#/utils/day";
import { db } from "#/utils/db";
import Cron from "croner";

const createNextEvents = async(email: string): Promise<void> => {
  const events = await google.getEvents(email, day(), day().add(7, "day"));

  for (const event of events) {
    if (event.status === "cancelled") continue;

    const eventSync = await db.eventSync.findFirst({ where: { googleEventID: event.id! } });
    if (eventSync) continue;

    const task = await todoist.addTask({
      content: event.summary,
      description: `${event.hangoutLink || ""}\n\n${event.location || ""}\n\n${event.description || ""}`,
      labels: [(await todoistUtils.getCalendarLabel()).id],
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

    logger("created", event);
  }
};

const updateEvents = async(email: string): Promise<void> => {
  const eventsGoogle = await google.getEvents(email, day(), day().add(7, "day"));
  const eventsSync = await db.eventSync.findMany({ where: { googleEventID: { in: eventsGoogle.map(event => event.id!) } } });

  for (const eventSync of eventsSync) {
    const eventGoogle = eventsGoogle.find(event => event.id === eventSync.googleEventID)!;

    if (day(eventGoogle.updated).toISOString() !== day(eventSync.googleLastUpdate).toISOString()) {
      if (eventGoogle.status === "cancelled") {
        await todoist.closeTask(eventSync.todoistID);
        logger("deleted", eventGoogle);
      } else {
        await todoist.reopenTask(eventSync.todoistID);
        await todoist.updateTask(eventSync.todoistID, {
          content: eventGoogle.summary,
          description: `${eventGoogle.hangoutLink || ""}\n\n${eventGoogle.location || ""}\n\n${eventGoogle.description || ""}`,
          dueDatetime: day.utc(eventGoogle.start?.dateTime),
          duration: day(eventGoogle.end?.dateTime).diff(eventGoogle.start?.dateTime, "minute"),
          durationUnit: "minute"
        });
        logger("updated", eventGoogle);
      }

      await db.eventSync.update({
        where: { id: eventSync.id },
        data: { googleLastUpdate: eventGoogle.updated! }
      });
    }
  }
};

const cron = Cron("* * * * *", async() => {
  const googleUsers = await db.googleUser.findMany();

  for (const user of googleUsers) {
    await createNextEvents(user.email);
    await updateEvents(user.email);
  }
});

void cron.trigger();