export const formatGoogleCalendarName = (calendar: GoogleAppsScript.Calendar.Calendar) => {
  return `<b><font color="${calendar.getColor()}">⬤</font> ${calendar.getName()}</b>`;
};
