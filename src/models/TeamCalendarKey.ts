const KEY_PREFIX = "TEAM_CALENDAR_";
const PARAMS_KEY = "calendarKey";

export type TeamCalendarKey = string & { __teamCalendarKey: never };
export const TeamCalendarKey = {
  forGoogleCalendarId: (calendarId: string) => `${KEY_PREFIX}${calendarId}` as TeamCalendarKey,
  is: (key: string): key is TeamCalendarKey => key.startsWith(KEY_PREFIX),
  toParameters: (key?: TeamCalendarKey): { [key: string]: string } =>
    key ? { [PARAMS_KEY]: key } : {},
  fromParameters: (params?: Partial<Record<string, string>>) =>
    params && params[PARAMS_KEY] && TeamCalendarKey.is(params[PARAMS_KEY])
      ? params[PARAMS_KEY]
      : undefined,
};
