import { SyncTriggerController } from "../controllers/SyncTriggerController";
import { TeamCalendarController } from "../controllers/TeamCalendarController";

/** Update all sync triggers for all calendars. */
export function updateSyncTriggers() {
  // This can take a while, so let's avoid concurrent runs to be safe. But, this task runs synchronously in the UI so
  // we really don't want to hit the 30s timeout here.
  // Here we could use LockController, but it doesn't make a difference since this job affects all calendars - it's
  // not resource specific. So we use the native locker for performance and simplicity.
  const lock = LockService.getUserLock();
  lock.waitLock(10_000);

  Logger.log("Updating all sync triggers");

  const allTeamMembers = new Set(
    TeamCalendarController.readAll().flatMap(([, teamCalendar]) =>
      Object.keys(teamCalendar.teamMembers),
    ),
  );

  const existingTriggers = SyncTriggerController.readAll();

  Logger.log("Deleting all existing sync triggers");

  for (const existingTriggerTeamMember of Object.keys(existingTriggers))
    try {
      SyncTriggerController.delete(existingTriggerTeamMember);
    } catch (e) {
      Logger.log(`Failed to delete existing sync trigger for ${existingTriggerTeamMember}: ${e}`);
    }

  Logger.log(`Creating new triggers for all team members in all calendars: ${[...allTeamMembers]}`);

  for (const teamMember of allTeamMembers)
    try {
      SyncTriggerController.create(teamMember);
    } catch (e) {
      Logger.log(`Failed to create new sync trigger for ${teamMember}: ${e}`);
    }

  Logger.log("Finished updating sync triggers");

  lock.releaseLock();
}
