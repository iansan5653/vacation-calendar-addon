import { describeTeamMembers } from "../jobs/getTeamMemberDisplayName";
import type { GoogleCalendarId } from "../models/GoogleCalendarId";
import { TeamCalendar, NewTeamCalendar } from "../models/TeamCalendar";

const formatDescription = (
  sourceCalendar: NewTeamCalendar,
) => `Automatically updated with out of office events from the following team members:

${describeTeamMembers(Object.keys(sourceCalendar.teamMembers), sourceCalendar.nameFormat)}`;

export const LinkedCalendarController = {
  create(sourceCalendar: NewTeamCalendar) {
    return CalendarApp.createCalendar(sourceCalendar.name, {
      hidden: false,
      summary: formatDescription(sourceCalendar),
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
  update(sourceCalendar: TeamCalendar) {
    const calendar = this.read(sourceCalendar.googleCalendarId);
    if (!calendar) return;

    calendar.setName(sourceCalendar.name);
    calendar.setDescription(formatDescription(sourceCalendar));
  },
};
