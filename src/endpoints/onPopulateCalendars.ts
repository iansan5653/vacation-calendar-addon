import { populateFrequency } from "../config";
import { QueueController } from "../controllers/QueueController";
import { TeamCalendarsController } from "../controllers/TeamCalendarsController";
import { populateCalendar } from "../jobs/populateCalendar";
import { Endpoint } from "./utils/Endpoint";

export const onPopulateCalendars: Endpoint = () => {
  const calendars = TeamCalendarsController.read();
  for (const [id, calendar] of calendars) populateCalendar(id, calendar);

  // Automatically repopulate later
  if (calendars.length) QueueController.queueOnce(onPopulateCalendars.name, populateFrequency);
};

export const PopulateCalendarsAction = () => {
  return CardService.newAction().setFunctionName(onPopulateCalendars.name);
};
