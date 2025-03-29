import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration.js";
import localizedFormat from "dayjs/plugin/localizedFormat.js";
import timezone from "dayjs/plugin/timezone.js";
import utc from "dayjs/plugin/utc.js";
import "dayjs/locale/fr.js";

dayjs.locale("fr");

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(duration);
dayjs.extend(localizedFormat);

export const day = dayjs;
export type Day = Dayjs;
