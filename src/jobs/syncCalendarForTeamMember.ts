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
  try {
    // using the calendar API here avoids parsing the source event dates and introducing time zone logic
    return Calendar.Events!.insert(
      buildEventObject(teamMemberDisplayName, sourceEvent),
      targetCalendarId,
    ).id;
  } catch (e) {
    Logger.log(`ERROR: failed to create event for ${teamMemberDisplayName}: ${e}`);
  }
}

function updateEvent(
  teamMemberDisplayName: string,
  sourceEvent: CalendarApiEvent,
  targetCalendarId: string,
  targetEventId: string,
) {
  try {
    Calendar.Events!.update(
      buildEventObject(teamMemberDisplayName, sourceEvent),
      targetCalendarId,
      targetEventId,
    );
  } catch (e) {
    Logger.log(`ERROR: failed to update event for ${teamMemberDisplayName}: ${e}`);
  }
}

function deleteEvent(calendarId: string, eventId: string) {
  try {
    Calendar.Events!.remove(calendarId, eventId, { sendUpdates: "none" });
  } catch (e) {
    // Probably no big deal - user probably deleted it already
    Logger.log(`WARNING: Failed to delete event ${eventId}: ${e}`);
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

  // It's forbidden to use parameters when syncing
  const queryParameters = syncToken
    ? {}
    : {
        eventTypes: ["outOfOffice"],
        timeMin: sub(new Date(), backPopulateWindow).toISOString(),
        singleEvents: false,
      };

  const allEvents: CalendarApiEvent[] = [];
  let pageToken = undefined;
  let nextSyncToken = undefined;
  do {
    // very strange that a type can't be inferred here
    const response: GoogleAppsScript.Calendar.Schema.Events = Calendar.Events!.list(calendarId, {
      ...queryParameters,
      pageToken,
      // don't combine syncing and paging
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
  Logger.log(`Syncing ${calendar.name} for ${teamMember}`);

  const syncState = calendar.teamMembers[teamMember] ?? TeamMemberSyncState.empty();

  let queryResult;
  try {
    Logger.log(
      syncState.syncToken
        ? `Attempting to query incremental sync with token ${syncState.syncToken}`
        : "Querying events for full sync",
    );
    queryResult = getOutOfOfficeEvents(teamMember, calendar.minEventDuration, syncState.syncToken);
  } catch (e) {
    if (syncState.syncToken) {
      Logger.log(`Failed to incrementally sync, retrying query as full sync: ${e}`);
      // sometimes syncing can fail with a 401 error, requiring a full sync
      queryResult = getOutOfOfficeEvents(teamMember, calendar.minEventDuration, undefined);
      syncState.syncToken = undefined;
    } else {
      // this wasn't an incremental sync so no point in retrying
      throw e;
    }
  }
  const { filteredEvents: sourceEvents, nextSyncToken } = queryResult;

  // if full sync, clear all existing events
  if (!syncState.syncToken) {
    Logger.log(
      `Deleting ${Object.keys(syncState.eventIds).length} existing events to prepare for full sync`,
    );
    for (const eventId of Object.values(syncState.eventIds))
      deleteEvent(calendar.googleCalendarId, eventId);
  }

  const displayName = getDisplayName(teamMember, calendar.nameFormat);
  Logger.log(`Display name for ${teamMember} is ${displayName}`);

  const newSyncState = { ...TeamMemberSyncState.empty(), syncToken: nextSyncToken };

  const counts = { deleted: 0, modified: 0, created: 0 };

  for (const sourceEvent of sourceEvents) {
    if (!sourceEvent.id) continue; // shouldn't happen; the types are overly broad here

    const teamCalendarEventId = syncState.eventIds[sourceEvent.id];

    if (sourceEvent.status === "cancelled" && teamCalendarEventId) {
      counts.deleted++;
      deleteEvent(calendar.googleCalendarId, teamCalendarEventId);
    } else if (teamCalendarEventId) {
      counts.modified++;
      updateEvent(displayName, sourceEvent, calendar.googleCalendarId, teamCalendarEventId);
      newSyncState.eventIds[sourceEvent.id] = teamCalendarEventId;
    } else if (sourceEvent.status !== "cancelled") {
      counts.created++;
      const newEventId = createEvent(displayName, sourceEvent, calendar.googleCalendarId);
      if (newEventId) newSyncState.eventIds[sourceEvent.id] = newEventId;
    }
  }

  Logger.log(`New sync state: ${JSON.stringify(newSyncState)}`);

  Logger.log(`Finished syncing for ${teamMember}: ${JSON.stringify(counts)}`);

  return newSyncState;
}
