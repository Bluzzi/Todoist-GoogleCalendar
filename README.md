# Todoist sync Google Calendar
An integration between Todoist and Google Calendar retrieves events for the next 7 days from Google Calendar and creates a synchronized copy on Todoist.

It is possible to synchronize multiple Google accounts with Todoist, and for each of them, the title, description, date, duration, and meeting links of the events are synchronized. Additionally, the email associated with the Google account is added as a label on the Todoist task.

Context: I primarily use Todoist to manage my daily tasks, but I'm required to use Google Calendar for work meetings. Having to use a second tool alongside Todoist isn't practical, and Todoist's default integration doesn't provide all the necessary information from Google Calendar: the meeting link and event description. That's why I created this integration.

## Setup
You need to configure [OAuth 2.0 and Consent Screen](https://support.google.com/cloud/answer/6158849) from the Google Cloud Platform Console.

For deployment, you'll need a server to deploy a NodeJS application containing a web server and a CRON, as well as a PostgreSQL database. I recommend the use of my template Railway, which enables one-click deployment.

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/AP1rpk?referralCode=J6p1cI)

You'll need to set the following environment variables (if you're using your own machine, you can define them in an `.env` file at the root of the project):
```sh
# The webserver port (default 3000):
PORT=3000

# The CRON string (default "* * * * *" every minute):
CRON="* * * * *"

# Google OAuth 2.0 Client ID and secret:
GOOGLE_CLIENT_ID="Google Client ID"
GOOGLE_CLIENT_SECRET="Google Client Secret"

# Todoist API token:
TODOIST_TOKEN="Todoist Token"

# PostgreSQL database URL:
POSTGRES_URL="Postgres URL"

# How many days you want to fecth on Todoist (default: 7):
DAYSTOFECTH="7"

# Ignored events (comma-separated list of event names):
IGNORE_EVENTS="Absent au bureau,Running"
```

You can also sync events from your Google Calendar with Todoist projects, for that you'll need to acces to the database and then go to the table `EventsSyncProjects`.

Create a new row in the table with the properties :
- `projectID`: The ID of the Todoist project (you can find it at the end of the url e.g: https://app.todoist.com/app/project/name-123456789)
- `email` (optional): The email associated with a Google Calendar (all events from this calendar will go into the project)
- `eventTitles` (optional): A list of event titles from your Google Calendar (all events that start with these titles will go into the project e.g: Lunch time, Focus time...)
- `priority`: Defines the order of priority for applying different filter rules

You must use at least either `email` or `eventTitles` to filter events into a Todoist project.

## Contributing
Contributions are welcome! Feel free to submit issues or pull requests.

## License
This project is licensed under the [MIT License](./LICENSE).