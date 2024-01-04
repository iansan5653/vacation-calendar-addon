import type { GoogleCalendarId } from "../models/GoogleCalendarId";

export const LinkedCalendarController = {
  create(name: string) {
    return CalendarApp.createCalendar(name, {
      hidden: false,
      summary: "Automatically updated team calendar.",
      selected: true,
    }).getId() as GoogleCalendarId;
  },
  read(id: GoogleCalendarId) {
    try {
      return CalendarApp.getCalendarById(id);
    } catch {
      return null;
    }
  },
  delete(id: GoogleCalendarId) {
    const calendar = this.read(id);
    if (!calendar) return false;
    try {
      calendar.deleteCalendar();
      return true;
    } catch {
      return false;
    }
  },
};
