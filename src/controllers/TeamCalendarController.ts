import { TeamCalendar } from "../models/TeamCalendar";
import { TeamCalendarId } from "../models/TeamCalendarId";

export const TeamCalendarController = {
  create(calendar: TeamCalendar) {
    const id = TeamCalendarId.new();
    PropertiesService.getUserProperties().setProperty(id, JSON.stringify(calendar));

    return {
      id,
      calendar,
    };
  },

  read(id: TeamCalendarId) {
    const json = PropertiesService.getUserProperties().getProperty(id);
    if (!json) return undefined;

    return JSON.parse(json, (key, value) =>
      key === "timestamp" ? new Date(value) : value,
    ) as TeamCalendar;
  },

  update(id: TeamCalendarId, data: Partial<TeamCalendar>) {
    const currentCalendar = TeamCalendarController.read(id);

    if (!currentCalendar) throw new Error("Failed to update calendar: not found");

    const updatedCalendar = { ...currentCalendar, ...data };

    PropertiesService.getUserProperties().setProperty(id, JSON.stringify(updatedCalendar));

    return updatedCalendar;
  },

  delete(id: TeamCalendarId) {
    PropertiesService.getUserProperties().deleteProperty(id);
  },

  /** Get all team calendars. */
  readAll() {
    return Object.entries(PropertiesService.getUserProperties().getProperties())
      .filter((entry): entry is [TeamCalendarId, string] => TeamCalendarId.is(entry[0]))
      .map(([id, json]) => [id, JSON.parse(json) as TeamCalendar] as const);
  },
};
