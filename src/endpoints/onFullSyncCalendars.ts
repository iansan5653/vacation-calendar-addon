import { Duration } from "date-fns";
import { QueueController } from "../controllers/QueueController";
import { TeamCalendarController } from "../controllers/TeamCalendarController";
import { fullSyncCalendar } from "../jobs/fullSyncCalendar";
import { Endpoint } from "./utils/Endpoint";

export const onFullSyncCalendars: Endpoint = () => {
  const calendars = TeamCalendarController.readAll();

  for (const [id, calendar] of calendars)
    try {
      fullSyncCalendar(id, calendar);
    } catch (error) {
      Logger.log({ id, error });
    }
};

// use QueueFullSyncCalendarsAction instead, for async
// export const FullSyncCalendarsAction

export const queueFullSyncCalendars = (after: Duration) => {
  QueueController.queueOnce(onFullSyncCalendars.name, after);
};
