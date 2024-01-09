import { LinkedCalendarController } from "../controllers/LinkedCalendarController";
import { TeamCalendarController } from "../controllers/TeamCalendarController";
import { queueFullSyncCalendars } from "../endpoints/onFullSyncCalendars";
import { NewTeamCalendar } from "../models/TeamCalendar";
import { updateSyncTriggers } from "./updateSyncTriggers";

export function createCalendar(config: NewTeamCalendar) {
  const googleCalendarId = LinkedCalendarController.create(config.name);

  const result = TeamCalendarController.create({
    ...config,
    googleCalendarId,
    syncStatus: {
      state: "pending",
      timestamp: new Date(),
    },
  });

  updateSyncTriggers();
  queueFullSyncCalendars({ seconds: 1 });

  return result;
}
