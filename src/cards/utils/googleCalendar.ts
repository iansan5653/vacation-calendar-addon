export const formatGoogleCalendarName = (calendar: GoogleAppsScript.Calendar.Calendar) => {
  return `<b><font color="${calendar.getColor()}">⬤</font> ${calendar.getName()}</b>`;
};

export const googleCalendarSettingsUrl = (calendar: GoogleAppsScript.Calendar.Calendar) => {
  return `https://calendar.google.com/calendar/r/settings/calendar/${Utilities.base64EncodeWebSafe(
    calendar.getId(),
  )}`;
};
