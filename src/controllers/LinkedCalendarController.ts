import type { GoogleCalendarId } from "../models/GoogleCalendarId";

export const LinkedCalendarController = {
  create(name: string) {
    return CalendarApp.createCalendar(name).getId() as GoogleCalendarId;
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
