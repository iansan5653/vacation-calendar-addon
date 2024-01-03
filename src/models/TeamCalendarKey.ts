const PREFIX = "TEAM_CALENDAR_";

export type TeamCalendarId = string & { __teamCalendarKey: never };
export const TeamCalendarId = {
  new: () => `${PREFIX}${Utilities.getUuid()}` as TeamCalendarId,
  is: (key: string): key is TeamCalendarId => key.startsWith(PREFIX),
};
