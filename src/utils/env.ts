import { z } from "zod";
import "dotenv/config";

const schema = z.object({
  TODOIST_TOKEN: z.string(),
  GOOGLE_ICAL_LINKS: z.string().transform(base => base.split(";")),
  SQLITE_FILE: z.string()
});

export const env = schema.parse(process.env);