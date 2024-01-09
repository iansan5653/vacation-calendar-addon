import { onFullSyncCalendars } from "..";
import { QueueController } from "../controllers/QueueController";
import { TeamCalendarController } from "../controllers/TeamCalendarController";

export function asyncFullSyncAllCalendars() {
  for (const [id, calendar] of TeamCalendarController.readAll())
    if (calendar.syncStatus.state !== "building" && calendar.syncStatus.state !== "rebuilding")
      TeamCalendarController.update(id, {
        syncStatus: { state: "rebuilding", timestamp: new Date() },
      });

  QueueController.queueOnce(onFullSyncCalendars.name, { seconds: 1 });
}
