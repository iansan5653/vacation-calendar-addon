import { TeamCalendarController } from "../controllers/TeamCalendarController";
import { TeamMemberSyncState } from "../models/TeamCalendar";
import { TeamCalendarId } from "../models/TeamCalendarId";

export function clearCalendar(
  teamCalendarId: TeamCalendarId,
  calendar = TeamCalendarController.read(teamCalendarId),
) {
  // no need to lock since we already lock fullSyncCalendar

  Logger.log(`Fully clearing calendar ${teamCalendarId}`);

  if (!calendar) throw new Error("Failed to clear calendar: not found");

  let pageNumber = 0;
  let deleted = 0;
  let pageToken;
  do {
    pageNumber++;
    const reponse: GoogleAppsScript.Calendar.Schema.Events = Calendar.Events!.list(
      calendar.googleCalendarId,
      { pageToken },
    );
    pageToken = reponse?.nextPageToken;

    const oldEvents = reponse?.items ?? [];
    Logger.log(`Page ${pageNumber}: Found ${oldEvents.length} events to delete`);

    for (const event of oldEvents)
      try {
        Calendar.Events!.remove(calendar.googleCalendarId, event.id!, { sendUpdates: "none" });
        deleted++;
      } catch (e) {
        Logger.log(`Failed to delete event ${event.id}: ${e}`);
      }
  } while (pageToken);

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
