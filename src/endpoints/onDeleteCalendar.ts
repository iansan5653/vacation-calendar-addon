import { ConfirmDeleteCalendarCard } from "../cards/ConfirmDeleteCalendar";
import { TeamCalendarId } from "../models/TeamCalendarId";
import { Endpoint } from "./utils/Endpoint";
import { TeamCalendarIdParameters } from "./utils/Parameters";

export const onDeleteCalendar: Endpoint = ({ commonEventObject }) => {
  const teamCalendarId = new TeamCalendarIdParameters(commonEventObject.parameters).getId();
  if (!teamCalendarId) throw new Error("Cannot delete calendar without ID");

  return CardService.newActionResponseBuilder()
    .setNavigation(CardService.newNavigation().pushCard(ConfirmDeleteCalendarCard(teamCalendarId)))
    .build();
};

export function DeleteCalendarAction(teamCalendarId: TeamCalendarId) {
  return CardService.newAction()
    .setFunctionName(onDeleteCalendar.name)
    .setParameters(new TeamCalendarIdParameters().setId(teamCalendarId).build());
}
