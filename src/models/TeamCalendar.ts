export interface NewTeamCalendar {
  name: string;
  teamMembers: string[];
}

export interface TeamCalendar extends NewTeamCalendar {
  googleCalendarId: string;
}