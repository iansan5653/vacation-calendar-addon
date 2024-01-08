import { Duration } from "date-fns";
import { fullSyncFrequency } from "../config";
import { QueueController } from "../controllers/QueueController";
import { TeamCalendarsController } from "../controllers/TeamCalendarsController";
import { fullSyncCalendar } from "../jobs/fullSyncCalendar";
import { Endpoint } from "./utils/Endpoint";

export const onFullSyncCalendars: Endpoint = () => {
  const calendars = TeamCalendarsController.read();

  for (const [id, calendar] of calendars)
    try {
      fullSyncCalendar(id, calendar);
    } catch (error) {
      Logger.log({ id, error });
    }

  // Automatically full sync again later
  if (calendars.length) queueFullSyncCalendars(fullSyncFrequency);
};

export const FullSyncCalendarsAction = () => {
  return CardService.newAction().setFunctionName(onFullSyncCalendars.name);
};

export const queueFullSyncCalendars = (after: Duration) => {
  QueueController.queueOnce(onFullSyncCalendars.name, after);
};
