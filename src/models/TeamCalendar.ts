import { GoogleCalendarId } from "./GoogleCalendarId";

export type NameFormat = "name" | "username" | "email";
export const NameFormat = {
  values: ["name", "username", "email"] as const satisfies NameFormat[],
  is: (str: string): str is NameFormat => NameFormat.values.includes(str as NameFormat),
  labels: {
    name: "Full names",
    username: "Usernames",
    email: "Email addresses",
  } as const satisfies Record<NameFormat, string>,
};

export interface NewTeamCalendar {
  name: string;
  /** Email addresses */
  teamMembers: string[];
  /** In hours */
  minEventDuration: number;
  nameFormat: NameFormat;
}

export interface TeamCalendar extends NewTeamCalendar {
  googleCalendarId: GoogleCalendarId;
  managedEventIds: string[];
}
