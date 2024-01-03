import { CalendarFormCard } from "../cards/CalendarForm";
import { TeamCalendarController } from "../controllers/TeamCalendarController";
import { TeamCalendarId } from "../models/TeamCalendarId";
import { Endpoint } from "./utils/Endpoint";
import { TeamCalendarIdParameters } from "./utils/Parameters";

// Note: this is a global action, so if the function is renamed it must also be updated in the manifest
export const onStartUpdateCalendar: Endpoint = ({ commonEventObject }) => {
  const teamCalendarId = new TeamCalendarIdParameters(commonEventObject.parameters).getId();

  const calendar = teamCalendarId ? TeamCalendarController.read(teamCalendarId) : undefined;

  const args = teamCalendarId && calendar ? { id: teamCalendarId, calendar } : undefined;

  const navigation = CardService.newNavigation().pushCard(CalendarFormCard(args));

  return CardService.newActionResponseBuilder().setNavigation(navigation).build();
};

export function StartUpdateCalendarAction(teamCalendarId?: TeamCalendarId) {
  return CardService.newAction()
    .setFunctionName(onStartUpdateCalendar.name)
    .setParameters(new TeamCalendarIdParameters().setId(teamCalendarId).build());
}
