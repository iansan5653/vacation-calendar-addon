import { TeamCalendar } from "../models/TeamCalendar";
import { TeamCalendarId } from "../models/TeamCalendarId";

export const TeamCalendarsController = {
  /** Get all team calendars. */
  read() {
    return Object.entries(PropertiesService.getUserProperties().getProperties())
      .filter((entry): entry is [TeamCalendarId, string] => TeamCalendarId.is(entry[0]))
      .map(([key, json]) => [key, JSON.parse(json) as TeamCalendar] as const);
  },
};
