# Todoist Sync with Google Calendar

## Description
This project is a Node.js-based CRON job that utilizes the Todoist API and Google Calendar API. Its primary function is to create a synchronized copy of all events from Google Calendar for the next 7 days on Todoist. It ensures synchronization of date, duration, title, and description of tasks, thus enabling users to access meeting links directly on Todoist, among other features.

## Key Features
- Automatically creates and synchronizes tasks on Todoist from Google Calendar events.
- Maintains synchronization even when modifications occur on either platform.
- Synchronizes date, duration, title, and description of tasks.

## Scripts
- `pnpm run start`: Executes the CRON job, which runs every minute and manages synchronization.
- `pnpm run auth`: Launches a small server to facilitate connecting Google accounts for synchronization.
- `pnpm run data`: Starts a web application to visualize the database.

## Environment Variables
```php
PORT=3000

GOOGLE_CLIENT_ID="Your Google Client ID"
GOOGLE_CLIENT_SECRET="Your Google Client Secret"

TODOIST_TOKEN="Your Todoist Token"

POSTGRES_URL="Your Postgres URL"
```

## Contributing
Contributions are welcome! Feel free to submit issues or pull requests.

## License
This project is licensed under the [MIT License](./LICENSE).