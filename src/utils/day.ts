import dayjs from "dayjs";

import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import duration from "dayjs/plugin/duration";
import localizedFormat from "dayjs/plugin/localizedFormat";

import "dayjs/locale/fr";

dayjs.locale("fr");

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(duration);
dayjs.extend(localizedFormat);

export const day = dayjs;
export { Dayjs as Day } from "dayjs";
