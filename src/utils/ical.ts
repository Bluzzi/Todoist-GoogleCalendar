import { env } from "#/utils/env";
import { parseICS } from "node-ical";
import { z } from "zod";

type ICalEvent = z.infer<typeof eventSchema>;
const eventSchema = z.object({
  id: z.string(),

  title: z.string(),
  description: z.string().optional(),
  updateDate: z.date(),

  startDate: z.date(),
  endDate: z.date(),

  organizer: z.string().email().optional(),
  attendees: z.array(z.string().email()).optional()
});

export const getICalEvents = async(): Promise<ICalEvent[]> => {
  const events: ICalEvent[] = [];

  for (const icalURL of env.GOOGLE_ICAL_LINKS) {
    const response = await fetch(icalURL);
    const text = await response.text();
    const calendar = parseICS(text);

    for (const data of Object.values(calendar) as Record<string, any>[]) {
      const event = parseEvent(data);
      if (event) events.push(event);

      if (data.recurrences) for (const recurrence of Object.values(data.recurrences as Record<string, any>)) {
        const event = parseEvent(recurrence); // https://icalendar.org/iCalendar-RFC-5545/3-8-5-3-recurrence-rule.html

        if (event) events.push(event);
      }
    }
  }

  return events;
};

const parseEvent = (data: any): ICalEvent | null => {
  try {
    return eventSchema.parse({
      id: data.uid,
      title: data.summary,
      description: data.description,
      updateDate: data.lastmodified,
      startDate: data.start,
      endDate: data.end,
      organizer: data.organizer?.val?.replace("mailto:", ""),
      attendees: Array.isArray(typeof data.attendee)
        ? data.attendee
          .map((element?: Record<string, string>) => element?.val?.replace("mailto:", ""))
          .filter((email?: string) => Boolean(email))
        : undefined
    });
  } catch {
    return null;
  }
};