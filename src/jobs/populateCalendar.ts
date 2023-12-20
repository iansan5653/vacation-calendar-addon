import { TeamCalendarController } from "../controllers/TeamCalendarController";
import { TeamCalendarKey } from "../models/TeamCalendarKey";
import { addMonths, isValid, parseISO } from "date-fns";

const isAllDayEvent = (event: GoogleAppsScript.Calendar.Schema.Event) => {
  if (!event.start) return;
  if (event.start.date) return true;
  if (!event.start.dateTime) return false;
  const parsed = parseISO(event.start.dateTime);
  if (isValid(parsed) && parsed.getHours() === 0 && parsed.getMinutes() === 0) return true;
};

const oooTitle = /^(OOO|Out of office)/i;
const isTitledOutOfOffice = (event: GoogleAppsScript.Calendar.Schema.Event) =>
  event.summary && oooTitle.test(event.summary);

/**
 * Completely wipe and repopulate a calendar.
 */
export function populateCalendar(calendarKey: TeamCalendarKey) {
  const calendar = TeamCalendarController.read(calendarKey);
  if (!calendar) throw new Error("Failed to populate calendar: Team calendar not found");

  const googleCalendar = CalendarApp.getCalendarById(calendar.googleCalendarId);
  if (!googleCalendar) throw new Error("Failed to populate calendar: Google calendar not found");

  for (const eventId of calendar.managedEventIds) {
    googleCalendar.getEventById(eventId)?.deleteEvent();
  }

  const newManagedEventIds = [];
  for (const teamMember of calendar.teamMembers) {
    const teamMemberCalendar = CalendarApp.getCalendarById(teamMember);
    if (!teamMemberCalendar) continue;

    const now = new Date();

    // here we must fall back to the Calendar API because CalendarApp does not
    // support querying for OOO events
    const events =
      Calendar.Events!.list(teamMember, {
        eventTypes: ["outOfOffice"],
        timeMin: now.toISOString(),
        timeMax: addMonths(now, 6).toISOString(),
        singleEvents: true,
      }).items ?? [];

    // presence of date field indicates all day
    for (const event of events)
      if (isAllDayEvent(event)) {
        // If it has more details in the title, append them to the event name
        const summary = isTitledOutOfOffice(event) ? " OOO" : ` OOO: ${event.summary}`;

        const start = parseISO(event.start?.date ?? event.start?.dateTime ?? "");
        let end = parseISO(event.end?.date ?? event.end?.dateTime ?? "");
        if (!isValid(start)) continue;
        if (!isValid(end)) end = start;

        const newEvent = googleCalendar.createAllDayEvent(
          `${teamMemberCalendar.getName()} ${summary}`,
          start,
          end,
        );
        newManagedEventIds.push(newEvent.getId());
      }
  }

  TeamCalendarController.update(calendarKey, { managedEventIds: newManagedEventIds });
}
