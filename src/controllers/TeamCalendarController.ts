import { NewTeamCalendar, TeamCalendar } from "../models/TeamCalendar";
import { TeamCalendarId } from "../models/TeamCalendarId";
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

    return JSON.parse(json) as TeamCalendar;
  },

  update(id: TeamCalendarId, data: Partial<TeamCalendar>) {
    const currentCalendar = TeamCalendarController.read(id);

    if (!currentCalendar) throw new Error("Failed to update calendar: not found");

    const updatedCalendar = { ...currentCalendar, ...data };

    PropertiesService.getUserProperties().setProperty(id, JSON.stringify(updatedCalendar));

    if ("name" in data)
      LinkedCalendarController.read(currentCalendar.googleCalendarId)?.setName(
        updatedCalendar.name,
      );

    return updatedCalendar;
  },

  delete(id: TeamCalendarId) {
    PropertiesService.getUserProperties().deleteProperty(id);
  },
};
