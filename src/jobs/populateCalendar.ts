import { populateWindow } from "../config";
import { TeamCalendarController } from "../controllers/TeamCalendarController";
import { TeamCalendarKey } from "../models/TeamCalendarKey";
import { add } from "date-fns";

type CalendarApiEvent = GoogleAppsScript.Calendar.Schema.Event;

const oooTitle = /^(OOO|Out of office)$/i;

const formatEventSummary = (teamMember: string, sourceEventSummary = "OOO") => {
  // only include the event name if it's not redundant with OOO
  return `${teamMember} OOO${oooTitle.test(sourceEventSummary) ? "" : `: ${sourceEventSummary}`}`;
};

/** Get all the OOO events on the calendar in the configured window. */
function getOutOfOfficeEvents(calendarId: string, now: Date) {
  // here we must fall back to the Calendar API because CalendarApp does not
  // support querying for OOO events
  return (
    Calendar.Events!.list(calendarId, {
      eventTypes: ["outOfOffice"],
      timeMin: now.toISOString(),
      timeMax: add(now, populateWindow).toISOString(),
      singleEvents: false,
    }).items ?? []
  );
}

/** Create a new event on the team calendar and return its ID. */
function createTeamCalendarEvent(
  teamMember: string,
  { summary, start, end, recurrence }: CalendarApiEvent,
  targetCalendarId: string,
) {
  // using the calendar API here avoids parsing the source event dates and introducing time zone logic
  return Calendar.Events!.insert(
    {
      summary: formatEventSummary(teamMember, summary),
      start,
      end,
      recurrence,
    },
    targetCalendarId,
  ).id;
}

/** Completely wipe and repopulate a calendar. */
export function populateCalendar(
  calendarKey: TeamCalendarKey,
  calendar = TeamCalendarController.read(calendarKey),
) {
  const now = new Date();

  if (!calendar) throw new Error("Failed to populate calendar: Team calendar not found");

  const googleCalendar = CalendarApp.getCalendarById(calendar.googleCalendarId);
  const googleCalendarId = googleCalendar?.getId();
  if (!googleCalendar) throw new Error("Failed to populate calendar: Google calendar not found");

  // Wipe the calendar
  for (const eventId of calendar.managedEventIds)
    try {
      googleCalendar.getEventById(eventId)?.deleteEvent();
    } catch (e) {
      // Probably no big deal - user probably deleted it already
      Logger.log(`Non-fatal error: Failed to delete event ${eventId}: ${e}`);
    }

  // Repopulate the calendar
  const newManagedEventIds = [];
  for (const teamMember of calendar.teamMembers)
    for (const sourceEvent of getOutOfOfficeEvents(teamMember, now)) {
      const id = createTeamCalendarEvent(teamMember, sourceEvent, googleCalendarId);
      if (id) newManagedEventIds.push(id);
    }

  TeamCalendarController.update(calendarKey, { managedEventIds: newManagedEventIds });
}
