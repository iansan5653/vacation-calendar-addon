import { TeamCalendarController } from "../controllers/TeamCalendarController";
import { syncCalendarForTeamMember } from "./syncCalendarForTeamMember";

/** Sync the team member for all calendars they are part of. */
export function syncTeamMember(teamMember: string) {
  const calendars = TeamCalendarController.readAll().filter(([, calendar]) =>
    Object.keys(calendar.teamMembers).includes(teamMember),
  );

  Logger.log(`Syncing ${teamMember} for ${calendars.length} calendars`);

  for (const [id, calendar] of calendars) {
    syncCalendarForTeamMember(calendar, teamMember);
    TeamCalendarController.update(id, { syncStatus: { state: "success", timestamp: new Date() } });
  }
}
