import { LinkedCalendarController } from "../controllers/LinkedCalendarController";
import { TeamCalendarController } from "../controllers/TeamCalendarController";
import { NewTeamCalendar } from "../models/TeamCalendar";
import { asyncFullSyncCalendar } from "./asyncFullSyncCalendar";
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
  asyncFullSyncCalendar(result.id);

  return result;
}
