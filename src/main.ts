import { google } from "#/services/google";
import { day } from "#/utils/day";

void (async() => {
  const events = await google.getEvents("camille@seedext.com", day(), day().add(7, "day"));
  // const event = await google.getEvent("camille@seedext.com", "5d5e65a9d8bb4b0f8fbdbc8ac569f598_20240401T090000Z");

  console.log(events);
})();