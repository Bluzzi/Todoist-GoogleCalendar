// async function getCalendarEvents(accessToken: string) {
//   try {
//     const calendar = google.calendar({ version: "v3", auth: OAuth2Client });
//     const response = await calendar.events.list({
//       calendarId: "primary",
//       auth: OAuth2Client
//     });

//     console.log("Calendar Events:");
//     response.data.items?.forEach((event, index) => {
//       console.log(`${index + 1}. ${event.summary} - ${event.start?.dateTime}`);
//     });
//   } catch (error) {
//     console.error("Error fetching calendar events:", error);
//   }
// }