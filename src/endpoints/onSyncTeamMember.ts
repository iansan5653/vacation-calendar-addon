import { syncTeamMember } from "../jobs/syncTeamMember";
import { CalendarSyncEndpoint } from "./utils/Endpoint";

export const onSyncTeamMember: CalendarSyncEndpoint = ({ calendarId }) => {
  syncTeamMember(calendarId);
};
