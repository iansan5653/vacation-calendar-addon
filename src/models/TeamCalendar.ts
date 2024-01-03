import {GoogleCalendarId} from "./GoogleCalendarId";

export interface NewTeamCalendar {
  name: string;
  /** Email addresses */
  teamMembers: string[];
  /** In hours */
  minEventDuration: number;
}

export interface TeamCalendar extends NewTeamCalendar {
  googleCalendarId: GoogleCalendarId;
  managedEventIds: string[];
}
