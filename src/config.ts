import { Duration } from "date-fns";

/** How far to populate calendars in the past. */
export const backPopulateWindow = { months: 6 } as const satisfies Duration;

/** How often, at a maximum, to populate calendars. */
export const populateFrequency = { weeks: 1 } as const satisfies Duration;
