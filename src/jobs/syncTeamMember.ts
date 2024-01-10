import { TeamCalendarController } from "../controllers/TeamCalendarController";
import { syncCalendarForTeamMember } from "./syncCalendarForTeamMember";

/** Sync the team member for all calendars they are part of. */
export function syncTeamMember(teamMember: string) {
  // If an event is created and then updated very quickly, it would trigger a second sync before the first one is
  // completed. This could create conflicts or even duplicate an event, so we lock to prevent this.

  // It might be cleaner to lock syncCalendarForTeamMember but then we'd need to move the sync state updates into there
  const lock = LockService.getUserLock();
  lock.waitLock(10_000); // Short timeout - syncs should be fast, and skipping a sync is ok. Will throw on failure.

  const calendars = TeamCalendarController.readAll().filter(
    ([, calendar]) =>
      Object.keys(calendar.teamMembers).includes(teamMember) &&
      // Locking only prevents concurrent syncs - full rebuilds aren't syncs. And rebuilds take a long time so conflicts
      // are likely. If the calendar is rebuilding though it's fine to just skip the sync since everything is getting recreated.
      calendar.syncStatus.state !== "building" &&
      calendar.syncStatus.state !== "rebuilding",
  );

  Logger.log(`Syncing ${teamMember} for ${calendars.length} calendars`);

  for (const [id, calendar] of calendars) {
    syncCalendarForTeamMember(calendar, teamMember);
    TeamCalendarController.update(id, { syncStatus: { state: "success", timestamp: new Date() } });
  }

  lock.releaseLock();
}
