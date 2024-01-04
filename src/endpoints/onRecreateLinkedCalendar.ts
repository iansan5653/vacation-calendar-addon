import { LinkedCalendarController } from "../controllers/LinkedCalendarController";
import { TeamCalendarController } from "../controllers/TeamCalendarController";
import { TeamCalendarId } from "../models/TeamCalendarId";
import { RefreshCalendarViewNavigation } from "./onRefreshCalendarView";
import { Endpoint } from "./utils/Endpoint";
import { TeamCalendarIdParameters } from "./utils/Parameters";

export const deleteCalendarFormFields = {
  deleteLinkedCalendar: "deleteLinkedCalendar",
};

export const onRecreateLinkedCalendar: Endpoint = ({ commonEventObject }) => {
  const teamCalendarId = new TeamCalendarIdParameters(commonEventObject.parameters).getId();
  if (!teamCalendarId)
    throw new Error("Missing parameter: Cannot recreate linked calendar without team calendar ID");

  const teamCalendar = TeamCalendarController.read(teamCalendarId);
  if (!teamCalendar) throw new Error("Team calendar not found");

  const googleCalendarId = LinkedCalendarController.create(teamCalendar.name);
  TeamCalendarController.update(teamCalendarId, { googleCalendarId });

  return CardService.newActionResponseBuilder()
    .setNavigation(RefreshCalendarViewNavigation(teamCalendarId))
    .build();
};

export function RecreateLinkedCalendarAction(teamCalendarId: TeamCalendarId) {
  return CardService.newAction()
    .setFunctionName(onRecreateLinkedCalendar.name)
    .setParameters(new TeamCalendarIdParameters().setId(teamCalendarId).build());
}
