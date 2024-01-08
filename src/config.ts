import { Duration } from "date-fns";

/** How far to populate calendars in the past. */
export const backPopulateWindow = { months: 6 } as const satisfies Duration;

/** How often, at a maximum, to full sync calendars. */
export const fullSyncFrequency = { weeks: 1 } as const satisfies Duration;
