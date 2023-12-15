export interface NewTeamCalendar {
  name: string;
  teamMembers: string[];
}

export interface TeamCalendar extends NewTeamCalendar {
  googleCalendarId: string;
}

const KEY_PREFIX = "TEAM_CALENDAR_";

export type TeamCalendarKey = string & { __teamCalendarKey: never };
export const TeamCalendarKey = {
  forGoogleCalendarId: (calendarId: string) => `${KEY_PREFIX}${calendarId}` as TeamCalendarKey,
  is: (key: string): key is TeamCalendarKey => key.startsWith(KEY_PREFIX),
};

export const TeamCalendarController = new (class {
  create({ name, teamMembers }: NewTeamCalendar) {
    const googleCalendar = CalendarApp.createCalendar(name);

    const calendar: TeamCalendar = { name, teamMembers, googleCalendarId: googleCalendar.getId() };

    PropertiesService.getUserProperties().setProperty(
      TeamCalendarKey.forGoogleCalendarId(googleCalendar.getId()),
      JSON.stringify(calendar),
    );

    return calendar;
  }

  read(id: TeamCalendarKey) {
    const json = PropertiesService.getUserProperties().getProperty(id);
    if (!json) return undefined;

    return JSON.parse(json) as TeamCalendar;
  }

  update(id: TeamCalendarKey, data: Partial<NewTeamCalendar>) {
    const currentCalendar = this.read(id);

    if (!currentCalendar) throw new Error("Failed to update calendar: not found");

    const updatedCalendar = { ...currentCalendar, ...data };

    PropertiesService.getUserProperties().setProperty(id, JSON.stringify(updatedCalendar));
  }

  delete(id: TeamCalendarKey) {
    PropertiesService.getUserProperties().deleteProperty(id);
  }
})();
