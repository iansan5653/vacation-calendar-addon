import { Duration } from "date-fns";
import { populateFrequency } from "../config";
import { QueueController } from "../controllers/QueueController";
import { TeamCalendarsController } from "../controllers/TeamCalendarsController";
import { populateCalendar } from "../jobs/populateCalendar";
import { Endpoint } from "./utils/Endpoint";

export const onPopulateCalendars: Endpoint = () => {
  const calendars = TeamCalendarsController.read();
  
  for (const [id, calendar] of calendars)
    try {
      populateCalendar(id, calendar);
    } catch (error) {
      Logger.log({ id, error });
    }

  // Automatically repopulate later
  if (calendars.length) queuePopulateCalendars(populateFrequency);
};

export const PopulateCalendarsAction = () => {
  return CardService.newAction().setFunctionName(onPopulateCalendars.name);
};

export const queuePopulateCalendars = (after: Duration) => {
  QueueController.queueOnce(onPopulateCalendars.name, after);
};
