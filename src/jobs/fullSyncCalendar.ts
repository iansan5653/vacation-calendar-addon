import { LinkedCalendarController } from "../controllers/LinkedCalendarController";
import { TeamCalendarController } from "../controllers/TeamCalendarController";
import { SyncStatus, TeamMemberSyncState } from "../models/TeamCalendar";
import { TeamCalendarId } from "../models/TeamCalendarId";
import { clearCalendar } from "./clearCalendar";
import { syncCalendarForTeamMember } from "./syncCalendarForTeamMember";

function updateStatus(teamCalendarId: TeamCalendarId, status: Omit<SyncStatus, "timestamp">) {
  TeamCalendarController.update(teamCalendarId, {
    syncStatus: { ...status, timestamp: new Date() },
  });
}

/** Fully wipe and resync the entire calendar. */
export function fullSyncCalendar(
  teamCalendarId: TeamCalendarId,
  calendar = TeamCalendarController.read(teamCalendarId),
) {
  // Avoid concurrent syncs. Unfortunately it's likely this will result in hitting the 6 minute execution limit, but
  // there's not much we can do. Ideally we'd kill the ongoing sync but that's much more complicated.
  const lock = LockService.getUserLock();
  lock.waitLock(120_000); // long timeout because full syncs take forever, and we really don't want to skip a full sync as it will leave us in a bad state

  if (!calendar) throw new Error("Failed to sync calendar: not found");

  Logger.log(`Fully wiping and repopulating ${calendar.name} (${teamCalendarId})`);
  Logger.log(calendar);

  if (calendar.syncStatus.state !== "building" && calendar.syncStatus.state !== "rebuilding")
    updateStatus(teamCalendarId, { state: "rebuilding" });

  const googleCalendar = LinkedCalendarController.read(calendar.googleCalendarId);
  if (!googleCalendar) {
    updateStatus(teamCalendarId, { state: "error", message: "Linked Google calendar not found" });
    return;
  }

  calendar = clearCalendar(teamCalendarId, calendar);

  Logger.log("Calendar cleared. Populating with each team member");

  const newSyncStates: Record<string, TeamMemberSyncState> = {};
  let error = undefined;
  for (const teamMemberEmail of Object.keys(calendar.teamMembers)) {
    try {
      const newSyncState = syncCalendarForTeamMember(calendar, teamMemberEmail);
      newSyncStates[teamMemberEmail] = newSyncState;
    } catch (e) {
      newSyncStates[teamMemberEmail] = TeamMemberSyncState.empty();
      Logger.log(`Failed to sync ${teamMemberEmail}: ${e}`);
      error = `Failed to sync ${teamMemberEmail}: ${e}`;
    }
  }

  Logger.log("Populated all team members");

  TeamCalendarController.update(teamCalendarId, {
    teamMembers: newSyncStates,
    syncStatus: {
      state: error ? "error" : "success",
      message: error,
      timestamp: new Date(),
    },
  });

  lock.releaseLock();
}
