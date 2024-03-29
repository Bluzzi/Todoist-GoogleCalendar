import { getICalEvents } from "#/utils/ical";
import { day } from "#/utils/day";

const main = async(): Promise<void> => {
  const allEvents = await getICalEvents();
  const nextEvents = allEvents.filter(event => day(event.startDate).isAfter(day())); // next 7 days
  const test = allEvents.filter(event => event.title === "Tech Sync");

  console.log(nextEvents);
};

void main().then(() => process.exit());