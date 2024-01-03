const KEY_PREFIX = "TEAM_CALENDAR_";

export type TeamCalendarKey = string & { __teamCalendarKey: never };
export const TeamCalendarKey = {
  forGoogleCalendarId: (calendarId: string) => `${KEY_PREFIX}${calendarId}` as TeamCalendarKey,
  is: (key: string): key is TeamCalendarKey => key.startsWith(KEY_PREFIX),
};
