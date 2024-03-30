import type { CalendarEvent } from "#/services/google";
import { day } from "#/utils/day";

export const logger = (action: "created" | "updated" | "deleted", event: CalendarEvent): void => {
  console.log([
    `${action.toUpperCase()} EVENT:`,
    `- title: ${event.summary}`,
    `- date: ${day.utc(event.start?.dateTime).format("LLLL")} (UTC)`,
    `- duration: ${day(event.end?.dateTime).diff(event.start?.dateTime, "minute")} minutes`
  ].join("\n"));
};