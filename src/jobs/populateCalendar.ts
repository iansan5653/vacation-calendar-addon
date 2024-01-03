import { populateWindow } from "../config";
import { LinkedCalendarController } from "../controllers/LinkedCalendarController";
import { TeamCalendarController } from "../controllers/TeamCalendarController";
import { TeamCalendarId } from "../models/TeamCalendarId";
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

function getTeamMemberName(email: string) {
  return (
    // not-yet-typed, see https://developers.google.com/people/api/rest/v1/people/searchDirectoryPeople
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (People.People! as any).searchDirectoryPeople({
      query: email,
      readMask: "names",
      sources: ["DIRECTORY_SOURCE_TYPE_DOMAIN_PROFILE", "DIRECTORY_SOURCE_TYPE_DOMAIN_CONTACT"],
      pageSize: 1,
    }).people?.[0]?.names?.[0]?.displayName ?? email
  );
}

function deleteEvent(calendarId: string, eventId: string) {
  try {
    Calendar.Events!.remove(calendarId, eventId, { sendUpdates: "none" });
  } catch (e) {
    // Probably no big deal - user probably deleted it already
    Logger.log(`Non-fatal error: Failed to delete event ${eventId}: ${e}`);
  }
}

/** Completely wipe and repopulate a calendar. */
export function populateCalendar(
  teamCalendarId: TeamCalendarId,
  calendar = TeamCalendarController.read(teamCalendarId),
) {
  Logger.log(`Populating calendar ${teamCalendarId}: ${JSON.stringify(calendar)})}`);
  const now = new Date();

  if (!calendar) throw new Error("Failed to populate calendar: Team calendar not found");

  const googleCalendar = LinkedCalendarController.read(calendar.googleCalendarId);
  if (!googleCalendar) {
    Logger.log("Failed to populate calendar: Linked Google calendar not found");
    return;
  }

  Logger.log("Clearing existing events");

  // Wipe the calendar
  for (const eventId of calendar.managedEventIds) deleteEvent(calendar.googleCalendarId, eventId);

  Logger.log("Finished clearing events");

  // Repopulate the calendar
  const newManagedEventIds = [];
  for (const teamMemberEmail of calendar.teamMembers) {
    const name = getTeamMemberName(teamMemberEmail);

    for (const sourceEvent of getOutOfOfficeEvents(
      teamMemberEmail,
      now,
      calendar.minEventDuration,
    )) {
      const id = createTeamCalendarEvent(name, sourceEvent, calendar.googleCalendarId);
      if (id) newManagedEventIds.push(id);
    }
  }

  TeamCalendarController.update(teamCalendarId, { managedEventIds: newManagedEventIds });
}
