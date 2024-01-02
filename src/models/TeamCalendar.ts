export interface NewTeamCalendar {
  name: string;
  /** Email addresses */
  teamMembers: string[];
  /** In hours */
  minEventDuration: number;
}

export interface TeamCalendar extends NewTeamCalendar {
  googleCalendarId: string;
  managedEventIds: string[];
}
