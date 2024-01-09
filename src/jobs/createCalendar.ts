import { LinkedCalendarController } from "../controllers/LinkedCalendarController";
import { TeamCalendarController } from "../controllers/TeamCalendarController";
import { NewTeamCalendar } from "../models/TeamCalendar";
import { asyncFullSyncAllCalendars } from "./asyncFullSyncAllCalendars";
import { updateSyncTriggers } from "./updateSyncTriggers";

export function createCalendar(config: NewTeamCalendar) {
  const googleCalendarId = LinkedCalendarController.create(config.name);

  const result = TeamCalendarController.create({
    ...config,
    googleCalendarId,
    syncStatus: {
      state: "building",
      timestamp: new Date(),
    },
  });

  updateSyncTriggers();
  asyncFullSyncAllCalendars();

  return result;
}
