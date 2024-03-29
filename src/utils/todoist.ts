import { TodoistApi } from "@doist/todoist-api-typescript";
import { env } from "./env";

export const todoist = new TodoistApi(env.TODOIST_TOKEN);