import { differenceInMinutes, parseISO, sub } from "date-fns";
import { TeamCalendar, TeamMemberSyncState } from "../models/TeamCalendar";
import { backPopulateWindow } from "../config";
import { getTeamMemberDisplayName } from "./getTeamMemberDisplayName";

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

/** Get all the OOO events on the calendar. */
function getOutOfOfficeEvents(calendarId: string, syncToken: string | undefined) {
  // here we must fall back to the Calendar API because CalendarApp does not
  // support querying for OOO events or incremental sync

  // Certain parameters are banned when syncing: iCalUID, orderBy, privateExtendedProperty, q, sharedExtendedProperty, timeMax, timeMin, updatedMin
  const queryParameters = syncToken
    ? {}
    : {
        timeMin: sub(new Date(), backPopulateWindow).toISOString(),
      };

  const events: CalendarApiEvent[] = [];
  let pageToken = undefined;
  let nextSyncToken = undefined;
  do {
    // very strange that a type can't be inferred here
    const response: GoogleAppsScript.Calendar.Schema.Events = Calendar.Events!.list(calendarId, {
      ...queryParameters,
      eventTypes: ["outOfOffice"],
      singleEvents: false,
      pageToken,
      syncToken,
    });
    Logger.log(`API response: ${JSON.stringify(response)}`);

    if (response.items) events.push(...response.items);

    pageToken = response.nextPageToken;
    nextSyncToken = response.nextSyncToken; // undefined until last page
  } while (pageToken !== undefined);

  Logger.log(`Found ${events.length} OOO events on ${calendarId} calendar`);

  return { events, nextSyncToken };
}

/** Update one team member in the calendar. Does NOT update calendar status or obtain locks! */
export function syncCalendarForTeamMember(
  calendar: TeamCalendar,
  teamMember: string,
): TeamMemberSyncState {
  Logger.log(`Syncing ${calendar.name} for ${teamMember}`);

  const syncState = calendar.teamMembers[teamMember] ?? TeamMemberSyncState.empty();

  Logger.log(`Current sync state: ${JSON.stringify(syncState)}`);

  let queryResult;
  try {
    Logger.log(
      syncState.syncToken
        ? `Attempting to query incremental sync with token ${syncState.syncToken}`
        : "Querying events for full sync",
    );
    queryResult = getOutOfOfficeEvents(teamMember, syncState.syncToken);
  } catch (e) {
    if (syncState.syncToken) {
      Logger.log(`Failed to incrementally sync, retrying query as full sync: ${e}`);
      // sometimes syncing can fail with a 401 error, requiring a full sync
      queryResult = getOutOfOfficeEvents(teamMember, undefined);
      syncState.syncToken = undefined;
    } else {
      // this wasn't an incremental sync so no point in retrying
      throw e;
    }
  }
  const { events: sourceEvents, nextSyncToken } = queryResult;

  // if full sync, clear all existing events
  if (!syncState.syncToken) {
    Logger.log(
      `Deleting ${Object.keys(syncState.eventIds).length} existing events to prepare for full sync`,
    );
    for (const eventId of Object.values(syncState.eventIds))
      deleteEvent(calendar.googleCalendarId, eventId);
  }

  const displayName = getTeamMemberDisplayName(teamMember, calendar.nameFormat);
  Logger.log(`Display name for ${teamMember} is ${displayName}`);

  const newSyncState = { eventIds: { ...syncState.eventIds }, syncToken: nextSyncToken };

  const counts = { deleted: 0, modified: 0, created: 0 };

  for (const sourceEvent of sourceEvents) {
    if (!sourceEvent.id) continue; // shouldn't happen; the types are overly broad here

    const teamCalendarEventId = syncState.eventIds[sourceEvent.id];
    const sourceEventIsLongEnough = durationInHours(sourceEvent) > calendar.minEventDuration;

    // account for event duration changes by deleting / adding events that cross the threshold
    if ((sourceEvent.status === "cancelled" || !sourceEventIsLongEnough) && teamCalendarEventId) {
      counts.deleted++;
      deleteEvent(calendar.googleCalendarId, teamCalendarEventId);
      delete newSyncState.eventIds[sourceEvent.id];
    } else if (teamCalendarEventId) {
      counts.modified++;
      updateEvent(displayName, sourceEvent, calendar.googleCalendarId, teamCalendarEventId);
      newSyncState.eventIds[sourceEvent.id] = teamCalendarEventId;
    } else if (sourceEvent.status !== "cancelled" && sourceEventIsLongEnough) {
      counts.created++;
      const newEventId = createEvent(displayName, sourceEvent, calendar.googleCalendarId);
      if (newEventId) newSyncState.eventIds[sourceEvent.id] = newEventId;
    }
  }

  Logger.log(`New sync state: ${JSON.stringify(newSyncState)}`);

  Logger.log(`Finished syncing for ${teamMember}: ${JSON.stringify(counts)}`);

  return newSyncState;
}
