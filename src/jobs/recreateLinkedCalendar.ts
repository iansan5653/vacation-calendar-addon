import { LinkedCalendarController } from "../controllers/LinkedCalendarController";
import { TeamCalendarController } from "../controllers/TeamCalendarController";
import { TeamCalendarId } from "../models/TeamCalendarId";
import { asyncFullSyncCalendar } from "./asyncFullSyncCalendar";

export function recreateLinkedCalendar(teamCalendarId: TeamCalendarId) {
  const teamCalendar = TeamCalendarController.read(teamCalendarId);
  if (!teamCalendar) throw new Error("Team calendar not found");

  const googleCalendarId = LinkedCalendarController.create(teamCalendar);

  // clear existing sync states
  const unsyncedTeamMembers = Object.fromEntries(
    Object.keys(teamCalendar.teamMembers).map((email) => [email, { eventIds: {} }] as const),
  );

  TeamCalendarController.update(teamCalendarId, {
    googleCalendarId,
    teamMembers: unsyncedTeamMembers,
  });

  asyncFullSyncCalendar(teamCalendarId);
}
