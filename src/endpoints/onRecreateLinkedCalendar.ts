import { recreateLinkedCalendar } from "../jobs/recreateLinkedCalendar";
import { TeamCalendarId } from "../models/TeamCalendarId";
import { RefreshCalendarViewNavigation } from "./onRefreshCalendarView";
import { Endpoint } from "./utils/Endpoint";
import { TeamCalendarIdParameters } from "./utils/Parameters";

export const onRecreateLinkedCalendar: Endpoint = ({ commonEventObject }) => {
  const teamCalendarId = new TeamCalendarIdParameters(commonEventObject.parameters).getId();
  if (!teamCalendarId)
    throw new Error("Missing parameter: Cannot recreate linked calendar without team calendar ID");

  recreateLinkedCalendar(teamCalendarId);

  return CardService.newActionResponseBuilder()
    .setNavigation(RefreshCalendarViewNavigation(teamCalendarId, true))
    .build();
};

export function RecreateLinkedCalendarAction(teamCalendarId: TeamCalendarId) {
  return CardService.newAction()
    .setFunctionName(onRecreateLinkedCalendar.name)
    .setParameters(new TeamCalendarIdParameters().setId(teamCalendarId).build());
}
