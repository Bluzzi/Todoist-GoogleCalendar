import { z } from "zod";
import "dotenv/config";

const schema = z.object({
  RAILWAY_PUBLIC_DOMAIN: z.string().transform((value) => `https://${value}`).optional(),
  PORT: z.coerce.number().default(3000),

  CRON: z.string().default("* * * * *"),

  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),

  TODOIST_TOKEN: z.string(),

  POSTGRES_URL: z.string().url(),

  IGNORE_EVENTS: z.string().transform((value) => value.split(",")).optional(),
});

export const env = schema.parse(process.env);
