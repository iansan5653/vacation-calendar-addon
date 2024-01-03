import { NewTeamCalendar, TeamCalendar } from "../models/TeamCalendar";
import { TeamCalendarKey } from "../models/TeamCalendarKey";
import { LinkedCalendarController } from "./LinkedCalendarController";

export const TeamCalendarController = {
  create({ name, teamMembers, minEventDuration }: NewTeamCalendar) {
    const googleCalendarId = LinkedCalendarController.create(name);

    const calendar: TeamCalendar = {
      name,
      teamMembers,
      googleCalendarId,
      managedEventIds: [],
      minEventDuration,
    };

    const key = TeamCalendarKey.forGoogleCalendarId(googleCalendarId);
    PropertiesService.getUserProperties().setProperty(key, JSON.stringify(calendar));

    return {
      key,
      calendar,
    };
  },

  read(id: TeamCalendarKey) {
    const json = PropertiesService.getUserProperties().getProperty(id);
    if (!json) return undefined;

    return JSON.parse(json) as TeamCalendar;
  },

  update(id: TeamCalendarKey, data: Partial<Omit<TeamCalendar, "googleCalendarId">>) {
    const currentCalendar = TeamCalendarController.read(id);

    if (!currentCalendar) throw new Error("Failed to update calendar: not found");

    const updatedCalendar = { ...currentCalendar, ...data };

    PropertiesService.getUserProperties().setProperty(id, JSON.stringify(updatedCalendar));

    if ("name" in data) LinkedCalendarController.read(currentCalendar.googleCalendarId)?.setName(updatedCalendar.name);
  },

  delete(id: TeamCalendarKey) {
    PropertiesService.getUserProperties().deleteProperty(id);
  },
};
