import { z } from "zod";
import "dotenv/config";

const schema = z.object({
  PORT: z.coerce.number().default(3000),

  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),

  TODOIST_TOKEN: z.string(),

  SQLITE_FILE: z.string()
});

export const env = schema.parse(process.env);