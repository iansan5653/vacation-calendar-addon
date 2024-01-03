const PREFIX = "TEAM_CALENDAR_";

export type TeamCalendarId = string & { __teamCalendarId: never };
export const TeamCalendarId = {
  new: () => `${PREFIX}${Utilities.getUuid()}` as TeamCalendarId,
  is: (str: string): str is TeamCalendarId => str.startsWith(PREFIX),
};
