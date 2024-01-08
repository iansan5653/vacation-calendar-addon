import { TeamCalendarController } from "../controllers/TeamCalendarController";
import { TeamMemberSyncState } from "../models/TeamCalendar";
import { TeamCalendarId } from "../models/TeamCalendarId";

export function clearCalendar(
  teamCalendarId: TeamCalendarId,
  calendar = TeamCalendarController.read(teamCalendarId),
) {
  Logger.log(`Fully clearing calendar ${teamCalendarId}`);

  if (!calendar) throw new Error("Failed to clear calendar: not found");

  const oldEvents = Calendar.Events?.list(calendar.googleCalendarId)?.items ?? [];
  Logger.log(`Found ${oldEvents.length} events to delete`);

  let deleted = 0;
  for (const event of oldEvents)
    try {
      Calendar.Events!.remove(calendar.googleCalendarId, event.id!, { sendUpdates: "none" });
      deleted++;
    } catch (e) {
      Logger.log(`Failed to delete event ${event.id}: ${e}`);
    }

  // clear sync states since all events got deleted
  const fullSyncStates = Object.fromEntries(
    Object.keys(calendar.teamMembers).map((email) => [email, TeamMemberSyncState.empty()]),
  );
  const updatedCalendar = TeamCalendarController.update(teamCalendarId, {
    teamMembers: fullSyncStates,
  });

  Logger.log(`Deleted ${deleted} events`);

  return updatedCalendar;
}
