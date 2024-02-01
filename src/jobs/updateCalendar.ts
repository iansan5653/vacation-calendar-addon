import { LinkedCalendarController } from "../controllers/LinkedCalendarController";
import { TeamCalendarController } from "../controllers/TeamCalendarController";
import { TeamCalendar } from "../models/TeamCalendar";
import { TeamCalendarId } from "../models/TeamCalendarId";
import { asyncFullSyncCalendar } from "./asyncFullSyncCalendar";
import { updateSyncTriggers } from "./updateSyncTriggers";

export function updateCalendar(calendarId: TeamCalendarId, fields: Partial<TeamCalendar>) {
  const updatedTeamCalendar = TeamCalendarController.update(calendarId, fields);

  LinkedCalendarController.update(updatedTeamCalendar);

  updateSyncTriggers();
  asyncFullSyncCalendar(calendarId);

  return updatedTeamCalendar;
}
