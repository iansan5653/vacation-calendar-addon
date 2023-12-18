import { NewTeamCalendar, TeamCalendar } from "../models/TeamCalendar";
import { TeamCalendarKey } from "../models/TeamCalendarKey";

export const TeamCalendarController = new (class {
  create({ name, teamMembers }: NewTeamCalendar) {
    const googleCalendar = CalendarApp.createCalendar(name);

    const calendar: TeamCalendar = {
      name,
      teamMembers,
      googleCalendarId: googleCalendar.getId(),
      managedEventIds: [],
    };

    const key = TeamCalendarKey.forGoogleCalendarId(googleCalendar.getId());
    PropertiesService.getUserProperties().setProperty(key, JSON.stringify(calendar));

    return {
      key,
      calendar,
    };
  }

  read(id: TeamCalendarKey) {
    const json = PropertiesService.getUserProperties().getProperty(id);
    if (!json) return undefined;

    return JSON.parse(json) as TeamCalendar;
  }

  update(id: TeamCalendarKey, data: Partial<Omit<TeamCalendar, "googleCalendarId">>) {
    const currentCalendar = this.read(id);

    if (!currentCalendar) throw new Error("Failed to update calendar: not found");

    const updatedCalendar = { ...currentCalendar, ...data };

    PropertiesService.getUserProperties().setProperty(id, JSON.stringify(updatedCalendar));
  }

  delete(id: TeamCalendarKey) {
    PropertiesService.getUserProperties().deleteProperty(id);
  }
})();
