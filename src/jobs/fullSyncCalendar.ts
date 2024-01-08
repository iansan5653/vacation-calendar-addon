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
  if (!calendar) throw new Error("Failed to sync calendar: not found");

  Logger.log(`Fully wiping and repopulating ${teamCalendarId}: ${JSON.stringify(calendar)})}`);

  updateStatus(teamCalendarId, { state: "pending" });

  const googleCalendar = LinkedCalendarController.read(calendar.googleCalendarId);
  if (!googleCalendar) {
    updateStatus(teamCalendarId, { state: "error", message: "Linked Google calendar not found" });
    return;
  }

  calendar = clearCalendar(teamCalendarId, calendar);

  const newSyncStates: Record<string, TeamMemberSyncState> = {};
  let error = undefined;
  for (const teamMemberEmail of Object.keys(calendar.teamMembers)) {
    try {
      const newSyncState = syncCalendarForTeamMember(calendar, teamMemberEmail);
      newSyncStates[teamMemberEmail] = newSyncState;
    } catch (e) {
      error = `Failed to sync ${teamMemberEmail}: ${e}`;
    }
  }

  TeamCalendarController.update(teamCalendarId, {
    teamMembers: newSyncStates,
    syncStatus: {
      state: error ? "error" : "success",
      message: error,
      timestamp: new Date(),
    },
  });
}
