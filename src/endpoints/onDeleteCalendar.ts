import { ConfirmDeleteCalendarCard } from "../cards/ConfirmDeleteCalendar";
import { TeamCalendarKey } from "../models/TeamCalendarKey";
import { Endpoint } from "./Endpoint";

export const onDeleteCalendar: Endpoint = ({ commonEventObject }) => {
  const key = TeamCalendarKey.fromParameters(commonEventObject.parameters);
  if (!key) throw new Error("Cannot delete calendar without key");

  return CardService.newActionResponseBuilder()
    .setNavigation(CardService.newNavigation().pushCard(ConfirmDeleteCalendarCard(key)))
    .build();
};

export function DeleteCalendarAction(calendarKey: TeamCalendarKey) {
  return CardService.newAction()
    .setFunctionName(onDeleteCalendar.name)
    .setParameters(TeamCalendarKey.toParameters(calendarKey));
}
