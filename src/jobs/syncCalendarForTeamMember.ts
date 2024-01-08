import { differenceInMinutes, parseISO, sub } from "date-fns";
import { NameFormat, TeamCalendar, TeamMemberSyncState } from "../models/TeamCalendar";
import { backPopulateWindow } from "../config";

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

  // differenceInHours would round to the nearest hour; we want a little more precision
  return Math.abs(differenceInMinutes(endDate, startDate)) / 60;
};

const buildEventObject = (
  teamMemberDisplayName: string,
  { summary, start, end, recurrence }: CalendarApiEvent,
) => ({
  summary: formatEventSummary(teamMemberDisplayName, summary),
  start,
  end,
  recurrence,
});

function createEvent(
  teamMemberDisplayName: string,
  sourceEvent: CalendarApiEvent,
  targetCalendarId: string,
) {
  // using the calendar API here avoids parsing the source event dates and introducing time zone logic
  return Calendar.Events!.insert(
    buildEventObject(teamMemberDisplayName, sourceEvent),
    targetCalendarId,
  ).id;
}

function updateEvent(
  teamMemberDisplayName: string,
  sourceEvent: CalendarApiEvent,
  targetCalendarId: string,
  targetEventId: string,
) {
  Calendar.Events!.update(
    buildEventObject(teamMemberDisplayName, sourceEvent),
    targetCalendarId,
    targetEventId,
  );
}

function deleteEvent(calendarId: string, eventId: string) {
  try {
    Calendar.Events!.remove(calendarId, eventId, { sendUpdates: "none" });
  } catch (e) {
    // Probably no big deal - user probably deleted it already
    Logger.log(`Failed to delete event ${eventId}: ${e}`);
  }
}

function getDisplayName(email: string, format: NameFormat) {
  switch (format) {
    case "email":
      return email;
    case "username":
      return email.split("@")[0];
    case "name":
      // fall back to querying the directory to get full name from contacts (only works in Workspace accounts)
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
}

/** Get all the OOO events on the calendar. */
function getOutOfOfficeEvents(
  calendarId: string,
  minDurationHours: number,
  syncToken: string | undefined,
) {
  // here we must fall back to the Calendar API because CalendarApp does not
  // support querying for OOO events or incremental sync

  const allEvents: CalendarApiEvent[] = [];
  let pageToken = undefined;
  let nextSyncToken = undefined;
  do {
    // very strange that a type can't be inferred here
    const response: GoogleAppsScript.Calendar.Schema.Events = Calendar.Events!.list(calendarId, {
      eventTypes: ["outOfOffice"],
      timeMin: sub(new Date(), backPopulateWindow).toISOString(),
      singleEvents: false,
      pageToken,
      syncToken: pageToken ? undefined : syncToken,
    });

    if (response.items) allEvents.push(...response.items);

    pageToken = response.nextPageToken;
    nextSyncToken = response.nextSyncToken; // undefined until last page
  } while (pageToken !== undefined);

  const filteredEvents = allEvents.filter((event) => durationInHours(event) >= minDurationHours);

  Logger.log(
    `${calendarId}: Using ${filteredEvents.length} long enough events of ${allEvents.length} total OOO events`,
  );

  return { filteredEvents, nextSyncToken };
}

/** Update one team member in the calendar. Does NOT update calendar status. */
export function syncCalendarForTeamMember(
  calendar: TeamCalendar,
  teamMember: string,
): TeamMemberSyncState {
  const syncState = calendar.teamMembers[teamMember] ?? TeamMemberSyncState.empty();

  let queryResult;
  try {
    queryResult = getOutOfOfficeEvents(
      calendar.googleCalendarId,
      calendar.minEventDuration,
      syncState.syncToken,
    );
  } catch (e) {
    Logger.log(`Failed to incrementally sync, retrying as full sync: ${e}`);
    // sometimes syncing can fail with a 401 error, requiring a full sync
    queryResult = getOutOfOfficeEvents(
      calendar.googleCalendarId,
      calendar.minEventDuration,
      undefined,
    );
    syncState.syncToken = undefined;
  }
  const { filteredEvents: sourceEvents, nextSyncToken } = queryResult;

  // if full sync, clear all existing events
  if (!syncState.syncToken)
    for (const eventId of Object.values(syncState.eventIds))
      deleteEvent(calendar.googleCalendarId, eventId);

  const displayName = getDisplayName(teamMember, calendar.nameFormat);

  const newSyncState = { ...TeamMemberSyncState.empty(), syncToken: nextSyncToken };

  for (const sourceEvent of sourceEvents) {
    if (!sourceEvent.id) continue; // shouldn't happen; the types are overly broad here

    const teamCalendarEventId = syncState.eventIds[sourceEvent.id];

    if (sourceEvent.status === "cancelled" && teamCalendarEventId) {
      // deleted
      deleteEvent(calendar.googleCalendarId, teamCalendarEventId);
    } else if (teamCalendarEventId) {
      // modified
      updateEvent(displayName, sourceEvent, calendar.googleCalendarId, teamCalendarEventId);
      newSyncState.eventIds[sourceEvent.id] = teamCalendarEventId;
    } else if (sourceEvent.status !== "cancelled") {
      // created
      const newEventId = createEvent(displayName, sourceEvent, calendar.googleCalendarId);
      if (newEventId) newSyncState.eventIds[sourceEvent.id] = newEventId;
    }
  }

  return newSyncState;
}
