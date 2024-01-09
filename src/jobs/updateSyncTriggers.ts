import { SyncTriggerController } from "../controllers/SyncTriggerController";
import { TeamCalendarController } from "../controllers/TeamCalendarController";

/** Update all sync triggers for all calendars. */
export function updateSyncTriggers() {
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
}
