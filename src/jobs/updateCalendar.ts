import { LinkedCalendarController } from "../controllers/LinkedCalendarController";
import { TeamCalendarController } from "../controllers/TeamCalendarController";
import { queueFullSyncCalendars } from "../endpoints/onFullSyncCalendars";
import { TeamCalendar } from "../models/TeamCalendar";
import { TeamCalendarId } from "../models/TeamCalendarId";
import { updateSyncTriggers } from "./updateSyncTriggers";

export function updateCalendar(calendarId: TeamCalendarId, fields: Partial<TeamCalendar>) {
  const updated = TeamCalendarController.update(calendarId, fields);

  // Update linked calendar name
  if ("name" in fields)
    LinkedCalendarController.read(updated.googleCalendarId)?.setName(updated.name);

  updateSyncTriggers();
  queueFullSyncCalendars({ seconds: 1 });

  return updated;
}
