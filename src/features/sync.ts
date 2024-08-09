import type { CalendarEvent } from "#/services/google";
import { google } from "#/services/google";
import { todoist } from "#/services/todoist";
import { day } from "#/utils/day";
import { db } from "#/utils/db";
import { env } from "#/utils/env";
import { logger } from "#/utils/logger";
import type { Duration } from "@doist/todoist-api-typescript";
import Cron from "croner";
import { safe } from "rustic-error";

const logUpdate = (action: "created" | "updated" | "deleted", event: CalendarEvent): void => {
  logger.info("event", [
    `${action.toUpperCase()}`,
    `- title: ${event.summary}`,
    `- date: ${day.utc(event.start?.dateTime).format("LLLL")} (UTC)`,
    `- duration: ${day(event.end?.dateTime).diff(event.start?.dateTime, "minute")} minutes`
  ].join("\n"));
};

const createNextEvents = async(email: string): Promise<void> => {
  const events = await google.getEvents(email, day(), day().add(7, "day"));

  for (const event of events) {
    if (event.status === "cancelled") continue;
    if (env.IGNORE_EVENTS?.filter(ignoreName => ignoreName.includes(event.summary?.toLowerCase() ?? "")).length) continue;

    const eventSync = await db.eventSync.findFirst({ where: { googleEventID: event.id! } });
    if (eventSync) continue;

    let duration = (event.end && event.start ? {
      duration: day(event.end.dateTime).diff(event.start.dateTime, "minute"),
      durationUnit: "minute"
    } : {}) satisfies { duration?: Duration["amount"]; durationUnit?: Duration["unit"] };
    if (duration.duration === 0) duration = {};

    const task = await todoist.addTask({
      content: event.summary ?? "No title",
      description: `${event.hangoutLink ? `${event.hangoutLink}?authuser=${email}` : ""}\n\n${event.location || ""}\n\n${event.description || ""}`,
      labels: [email],
      dueDatetime: day.utc(event.start?.dateTime).toISOString(),
      ...duration
    });

    await db.eventSync.create({ data: {
      todoistID: task.id,

      googleUserEmail: email,

      googleCalendarID: event.calendarId,
      googleEventID: event.id!,
      googleLastUpdate: event.updated!
    } });

    logUpdate("created", event);
  }
};

const updateEvents = async(email: string): Promise<void> => {
  const eventsGoogle = await google.getEvents(email, day(), day().add(7, "day"));
  const eventsSync = await db.eventSync.findMany({ where: { googleEventID: { in: eventsGoogle.map(event => event.id!) } } });

  for (const eventSync of eventsSync) {
    const eventGoogle = eventsGoogle.find(event => event.id === eventSync.googleEventID)!;

    if (day(eventGoogle.updated).toISOString() !== day(eventSync.googleLastUpdate).toISOString()) {
      if (eventGoogle.status === "cancelled") {
        await safe(() => todoist.closeTask(eventSync.todoistID));

        logUpdate("deleted", eventGoogle);
      } else {
        let duration = (eventGoogle.end && eventGoogle.start ? {
          duration: day(eventGoogle.end.dateTime).diff(eventGoogle.start.dateTime, "minute"),
          durationUnit: "minute"
        } : {}) satisfies { duration?: Duration["amount"]; durationUnit?: Duration["unit"] };
        if (duration.duration === 0) duration = {};

        await safe(() => todoist.reopenTask(eventSync.todoistID));
        await safe(() => todoist.updateTask(eventSync.todoistID, {
          content: eventGoogle.summary ?? "No title",
          description: [
            eventGoogle.hangoutLink ? `${eventGoogle.hangoutLink}?authuser=${email}` : "",
            eventGoogle.location || "",
            eventGoogle.description || ""
          ].join("\n\n"),
          dueDatetime: day.utc(eventGoogle.start?.dateTime).toISOString(),
          ...duration
        }));

        logUpdate("updated", eventGoogle);
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

if (process.argv.includes("dev")) void cron.trigger();

logger.success("sync", `cron ${env.CRON} started`);