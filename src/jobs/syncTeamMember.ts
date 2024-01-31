import { LockController } from "../controllers/LockController";
import { TeamCalendarController } from "../controllers/TeamCalendarController";
import { syncCalendarForTeamMember } from "./syncCalendarForTeamMember";

/** Sync the team member for all calendars they are part of. */
export function syncTeamMember(teamMember: string) {
  const calendars = TeamCalendarController.readAll().filter(([, calendar]) =>
    Object.keys(calendar.teamMembers).includes(teamMember),
  );

  Logger.log(`Syncing ${teamMember} for ${calendars.length} calendars`);

  // If an event is created and then updated very quickly, it would trigger a second sync before the first one is
  // completed. This could create conflicts or even duplicate an event, so we lock to prevent this.
  for (const [id] of calendars)
    LockController.withLock(
      id,
      10, // short timeout since team member syncs are not important
    )(() => {
      // by the time we obtain the lock the sync state might have been updated, so don't reuse old read
      const calendar = TeamCalendarController.read(id);
      if (!calendar) throw new Error("Failed to sync because calendar was deleted");
      const newSyncState = syncCalendarForTeamMember(calendar, teamMember);
      TeamCalendarController.update(id, {
        syncStatus: { state: "success", timestamp: new Date() },
        teamMembers: {
          ...calendar.teamMembers,
          [teamMember]: newSyncState,
        },
      });
    });
}
