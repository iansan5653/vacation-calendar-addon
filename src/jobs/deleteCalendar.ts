import { LinkedCalendarController } from "../controllers/LinkedCalendarController";
import { TeamCalendarController } from "../controllers/TeamCalendarController";
import { TeamCalendarId } from "../models/TeamCalendarId";
import { updateSyncTriggers } from "./updateSyncTriggers";

export function deleteCalendar(teamCalendarId: TeamCalendarId, deleteLinkedCalendar: boolean) {
  if (deleteLinkedCalendar) {
    const googleCalendarId = TeamCalendarController.read(teamCalendarId)?.googleCalendarId;
    if (googleCalendarId) LinkedCalendarController.delete(googleCalendarId);
  }

  TeamCalendarController.delete(teamCalendarId);

  updateSyncTriggers();
}
