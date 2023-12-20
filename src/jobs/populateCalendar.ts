import { TeamCalendarController } from "../controllers/TeamCalendarController";
import { TeamCalendarKey } from "../models/TeamCalendarKey";
import { Duration, add, isValid, parseISO } from "date-fns";

/** How far to populate the calendar into the future. */
const windowDuration = { months: 6 } as const satisfies Duration;

type CalendarApiEvent = GoogleAppsScript.Calendar.Schema.Event;

const isAllDayEvent = (event: CalendarApiEvent) => {
  if (!event.start) return;
  if (event.start.date) return true;
  if (!event.start.dateTime) return false;
  const parsed = parseISO(event.start.dateTime);
  if (isValid(parsed) && parsed.getHours() === 0 && parsed.getMinutes() === 0) return true;
};

const oooTitle = /^(OOO|Out of office)$/i;

const formatEventTitle = (teamMember: string, sourceEvent: CalendarApiEvent) => {
  const sourceSummary = sourceEvent.summary || "OOO";
  // only include the event name if it's not redundant with OOO
  return `${teamMember} OOO${oooTitle.test(sourceSummary) ? "" : `: ${sourceSummary}`}`;
};

const getStart = (event: CalendarApiEvent) => {
  const parsed = parseISO(event.start?.date ?? event.start?.dateTime ?? "");
  return isValid(parsed) ? parsed : null;
};

const getEnd = (event: CalendarApiEvent) => {
  const parsed = parseISO(event.end?.date ?? event.end?.dateTime ?? "");
  return isValid(parsed) ? parsed : null;
};

/** Get all the all-day OOO events on the calendar in the configured window. */
function getAllDayOutOfOfficeEvents(calendarId: string, now: Date) {
  // here we must fall back to the Calendar API because CalendarApp does not
  // support querying for OOO events
  const allEvents =
    Calendar.Events!.list(calendarId, {
      eventTypes: ["outOfOffice"],
      timeMin: now.toISOString(),
      timeMax: add(now, windowDuration).toISOString(),
      singleEvents: true,
    }).items ?? [];
  return allEvents.filter(isAllDayEvent);
}

/** Create a new event on the team calendar and return its ID. */
function createTeamCalendarEvent(
  teamMember: string,
  sourceEvent: CalendarApiEvent,
  targetCalendar: GoogleAppsScript.Calendar.Calendar,
) {
  const start = getStart(sourceEvent);
  if (!start) return null;

  const end = getEnd(sourceEvent) ?? start;

  const newEvent = targetCalendar.createAllDayEvent(
    formatEventTitle(teamMember, sourceEvent),
    start,
    end,
  );

  return newEvent.getId();
}

/**
 * Completely wipe and repopulate a calendar.
 */
export function populateCalendar(calendarKey: TeamCalendarKey) {
  const now = new Date();

  const calendar = TeamCalendarController.read(calendarKey);
  if (!calendar) throw new Error("Failed to populate calendar: Team calendar not found");

  const googleCalendar = CalendarApp.getCalendarById(calendar.googleCalendarId);
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
    for (const sourceEvent of getAllDayOutOfOfficeEvents(teamMember, now)) {
      const id = createTeamCalendarEvent(teamMember, sourceEvent, googleCalendar);
      if (id) newManagedEventIds.push(id);
    }

  TeamCalendarController.update(calendarKey, { managedEventIds: newManagedEventIds });
}
