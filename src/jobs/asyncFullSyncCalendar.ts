import { onFullSyncCalendar } from "..";
import { QueueController } from "../controllers/QueueController";
import { TeamCalendarController } from "../controllers/TeamCalendarController";
import { TeamCalendarId } from "../models/TeamCalendarId";

export function asyncFullSyncCalendar(calendarId: TeamCalendarId) {
  const calendar = TeamCalendarController.read(calendarId);
  if (!calendar) throw new Error(`Calendar ${calendarId} not found`);

  if (calendar.syncStatus.state !== "building" && calendar.syncStatus.state !== "rebuilding")
    TeamCalendarController.update(calendarId, {
      syncStatus: { state: "rebuilding", timestamp: new Date() },
    });

  QueueController.queue(onFullSyncCalendar.name, { seconds: 1 }, calendarId);
}
