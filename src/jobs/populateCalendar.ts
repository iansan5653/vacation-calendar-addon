import { populateWindow } from "../config";
import { TeamCalendarController } from "../controllers/TeamCalendarController";
import { TeamCalendarKey } from "../models/TeamCalendarKey";
import { add, differenceInMinutes, parseISO } from "date-fns";

type CalendarApiEvent = GoogleAppsScript.Calendar.Schema.Event;

const oooTitle = /^(OOO|Out of office)$/i;

const formatEventSummary = (teamMember: string, sourceEventSummary = "OOO") => {
  // only include the event name if it's not redundant with OOO
  return `${teamMember} OOO${oooTitle.test(sourceEventSummary) ? "" : `: ${sourceEventSummary}`}`;
};

const parseDateTime = (dateTime: GoogleAppsScript.Calendar.Schema.EventDateTime) => {
  if (dateTime.date) return parseISO(dateTime.date);
  if (dateTime.dateTime) return parseISO(dateTime.dateTime);
};

const durationInHours = ({ start, end }: CalendarApiEvent) => {
  const startDate = start && parseDateTime(start);
  const endDate = end && parseDateTime(end);
  if (!startDate || !endDate) return -1;

  // durationInHours would round to the nearest hour; we want a little more precision
  return Math.abs(differenceInMinutes(endDate, startDate)) / 60;
};

/** Get all the OOO events on the calendar in the configured window. */
function getOutOfOfficeEvents(calendarId: string, now: Date, minDurationHours: number) {
  // here we must fall back to the Calendar API because CalendarApp does not
  // support querying for OOO events
  const all =
    Calendar.Events!.list(calendarId, {
      eventTypes: ["outOfOffice"],
      timeMin: now.toISOString(),
      timeMax: add(now, populateWindow).toISOString(),
      singleEvents: false,
    }).items ?? [];

  const filtered = all.filter((event) => durationInHours(event) >= minDurationHours);

  Logger.log(
    `${calendarId}: Using ${filtered.length} long enough events of ${all.length} total OOO events`,
  );

  return filtered;
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
  Logger.log(`Populating calendar ${calendarKey}: ${JSON.stringify(calendar)})}`);
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
    for (const sourceEvent of getOutOfOfficeEvents(teamMember, now, calendar.minEventDuration)) {
      const id = createTeamCalendarEvent(teamMember, sourceEvent, googleCalendarId);
      if (id) newManagedEventIds.push(id);
    }

  TeamCalendarController.update(calendarKey, { managedEventIds: newManagedEventIds });
}
