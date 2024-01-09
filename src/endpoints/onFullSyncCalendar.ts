import { QueueController } from "../controllers/QueueController";
import { fullSyncCalendar } from "../jobs/fullSyncCalendar";
import { TeamCalendarId } from "../models/TeamCalendarId";
import { TimeDrivenEndpoint } from "./utils/Endpoint";

/** This endpoint is time driven because it should onlybe called asynchronously by queuing. */
export const onFullSyncCalendar: TimeDrivenEndpoint = (event) => {
  const calendarId = QueueController.retrieveData(event);
  if (!calendarId || !TeamCalendarId.is(calendarId))
    throw new Error("Calendar ID not found for this event");

  fullSyncCalendar(calendarId);
};

// use QueueFullSyncCalendarsAction instead, for async
// export const FullSyncCalendarsAction
