import type { Label } from "@doist/todoist-api-typescript";
import { TodoistApi } from "@doist/todoist-api-typescript";
import { env } from "#/utils/env";

export const todoist = new TodoistApi(env.TODOIST_TOKEN);

/**
 * @see {@link https://developer.todoist.com/guides/#colors}
 */
const getCalendarLabel = async(): Promise<Label> => {
  const allLabels = await todoist.getLabels();

  const labelName = "calendar";
  const label = allLabels.find(label => label.name === labelName);

  if (label) return label;

  return await todoist.addLabel({ name: "calendar", color: "charcoal" });
};

export const todoistUtils = { getCalendarLabel };