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

type SyncState = "rebuilding" | "building" | "success" | "error";

export interface SyncStatus {
  state: SyncState;
  timestamp: Date;
  message?: string;
}

export interface TeamMemberSyncState {
  syncToken?: string;
  /** Map of original event ID to team-calendar event ID. */
  eventIds: Record<string, string>;
}
export const TeamMemberSyncState = {
  empty: (): TeamMemberSyncState => ({ eventIds: {} }),
};

export interface NewTeamCalendar {
  name: string;
  /** Keyed by email addresses (calendar IDs). */
  teamMembers: Record<string, TeamMemberSyncState>;
  /** In hours */
  minEventDuration: number;
  nameFormat: NameFormat;
}

export interface TeamCalendar extends NewTeamCalendar {
  googleCalendarId: GoogleCalendarId;
  syncStatus: SyncStatus;
}
