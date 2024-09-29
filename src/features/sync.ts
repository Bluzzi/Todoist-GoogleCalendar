/* eslint-disable max-len */
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
    `- date: ${day.utc(event.start?.dateTime ?? event.start?.date).format("LLLL")} (UTC)`,
    `- duration: ${day(event.end?.dateTime).diff(event.start?.dateTime, "minute")} minutes`
  ].join("\n"));
};

const createNextEvents = async(email: string): Promise<void> => {
  const events = await google.getEvents(email, day(), day().add(Number(env.DAYSTOFECTH), "day"));
  const syncWithProjects = await db.eventsSyncProjects.findMany({
    orderBy: { priority: "asc" }
  });

  for (const event of events) {
    if (event.status === "cancelled") continue;
    if (env.IGNORE_EVENTS?.filter(ignoreName => ignoreName.toLowerCase().includes(event.summary?.toLowerCase() ?? "")).length) continue;

    const eventSync = await db.eventSync.findFirst({ where: { googleEventID: event.id! } });
    if (eventSync) continue;

    let duration: { duration: Duration["amount"]; durationUnit: Duration["unit"] } | null
      = (event.end && event.start ? {
        duration: day(event.end.dateTime).diff(event.start.dateTime, "minute"),
        durationUnit: "minute"
      } : null);

    if (duration && duration.duration === 0) {
      duration = null;
    }

    for (const project of syncWithProjects) {
      const emailMatches = project.email === email;
      const titleMatches = project.eventTitles.some(title => event.summary?.toLowerCase().includes(title.toLowerCase()));

      const dueDateTime = event.start?.dateTime ? day.utc(event.start?.dateTime).toISOString() : day.utc(event.start?.date).format("YYYY-MM-DD").toString();

      if (emailMatches || titleMatches) {
        const task = await todoist.addTask({
          content: event.summary ?? "No title",
          description: [
            event.hangoutLink ? `${event.hangoutLink}?authuser=${email}` : "",
            event.location || "",
            event.description || ""
          ].join("\n\n"),
          dueDatetime: dueDateTime,
          projectId: project.projectID,
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

        break;
      }
    }
  }
};

const updateEvents = async(email: string): Promise<void> => {
  const eventsGoogle = await google.getEvents(email, day(), day().add(Number(env.DAYSTOFECTH), "day"));
  const eventsSync = await db.eventSync.findMany({ where: { googleEventID: { in: eventsGoogle.map(event => event.id!) } } });

  for (const eventSync of eventsSync) {
    const eventGoogle = eventsGoogle.find(event => event.id === eventSync.googleEventID)!;

    if (day(eventGoogle.updated).toISOString() !== day(eventSync.googleLastUpdate).toISOString()) {
      if (eventGoogle.status === "cancelled") {
        await safe(() => todoist.closeTask(eventSync.todoistID));

        logUpdate("deleted", eventGoogle);
      } else {
        let duration: { duration: Duration["amount"]; durationUnit: Duration["unit"] } | null
        = (eventGoogle.end && eventGoogle.start ? {
          duration: day(eventGoogle.end.dateTime).diff(eventGoogle.start.dateTime, "minute"),
          durationUnit: "minute"
        } : null);

        if (duration && duration.duration === 0) {
          duration = null;
        }

        const dueDateTime = eventGoogle.start?.dateTime ? day.utc(eventGoogle.start?.dateTime).toISOString() : day.utc(eventGoogle.start?.date).format("YYYY-MM-DD").toString();

        await safe(() => todoist.reopenTask(eventSync.todoistID));
        await safe(() => todoist.updateTask(eventSync.todoistID, {
          content: eventGoogle.summary ?? "No title",
          description: [
            eventGoogle.hangoutLink ? `${eventGoogle.hangoutLink}?authuser=${email}` : "",
            eventGoogle.location || "",
            eventGoogle.description || ""
          ].join("\n\n"),
          dueDatetime: dueDateTime,
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