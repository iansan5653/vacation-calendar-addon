import { LinkedCalendarController } from "../controllers/LinkedCalendarController";
import { TeamCalendarController } from "../controllers/TeamCalendarController";
import { TeamCalendarId } from "../models/TeamCalendarId";
import { queueFullSyncCalendars } from "./onFullSyncCalendars";
import { RefreshCalendarViewNavigation } from "./onRefreshCalendarView";
import { Endpoint } from "./utils/Endpoint";
import { TeamCalendarIdParameters } from "./utils/Parameters";

export const onRecreateLinkedCalendar: Endpoint = ({ commonEventObject }) => {
  const teamCalendarId = new TeamCalendarIdParameters(commonEventObject.parameters).getId();
  if (!teamCalendarId)
    throw new Error("Missing parameter: Cannot recreate linked calendar without team calendar ID");

  const teamCalendar = TeamCalendarController.read(teamCalendarId);
  if (!teamCalendar) throw new Error("Team calendar not found");

  const googleCalendarId = LinkedCalendarController.create(teamCalendar.name);
  // clear existing sync states
  const unsyncedTeamMembers = Object.fromEntries(
    Object.keys(teamCalendar.teamMembers).map((email) => [email, { eventIds: {} }] as const),
  );
  TeamCalendarController.update(teamCalendarId, {
    googleCalendarId,
    teamMembers: unsyncedTeamMembers,
  });

  queueFullSyncCalendars({ seconds: 1 });

  return CardService.newActionResponseBuilder()
    .setNavigation(RefreshCalendarViewNavigation(teamCalendarId, true))
    .build();
};

export function RecreateLinkedCalendarAction(teamCalendarId: TeamCalendarId) {
  return CardService.newAction()
    .setFunctionName(onRecreateLinkedCalendar.name)
    .setParameters(new TeamCalendarIdParameters().setId(teamCalendarId).build());
}
