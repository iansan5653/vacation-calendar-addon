import { SyncTriggerController } from "../controllers/SyncTriggerController";
import { TeamCalendarController } from "../controllers/TeamCalendarController";

/** Update all sync triggers for all calendars. */
export function updateSyncTriggers() {
  // This can take a while, so let's avoid concurrent runs to be safe. But, this task runs synchronously in the UI so
  // we really don't want to hit the 30s timeout here.
  const lock = LockService.getUserLock();
  lock.waitLock(10_000);

  Logger.log("Updating all sync triggers");

  const allTeamMembers = new Set(
    TeamCalendarController.readAll().flatMap(([, teamCalendar]) =>
      Object.keys(teamCalendar.teamMembers),
    ),
  );

  const existingTriggers = SyncTriggerController.readAll();

  for (const existingTriggerTeamMember of Object.keys(existingTriggers))
    if (!allTeamMembers.has(existingTriggerTeamMember))
      SyncTriggerController.delete(existingTriggerTeamMember);

  for (const teamMember of allTeamMembers) SyncTriggerController.create(teamMember);

  lock.releaseLock();
}
