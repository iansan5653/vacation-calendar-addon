import { TeamCalendar, TeamCalendarKey } from "./TeamCalendarController";

export const TeamCalendarsController = new (class {
  /** Get all team calendars. */
  read() {
    return Object.entries(PropertiesService.getUserProperties().getProperties())
      .filter((entry): entry is [TeamCalendarKey, string] => TeamCalendarKey.is(entry[0]))
      .map(([key, json]) => [key, JSON.parse(json) as TeamCalendar] as const);
  }
})();