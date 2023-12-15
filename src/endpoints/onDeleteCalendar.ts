import { ConfirmDeleteCalendarCard } from "../cards/ConfirmDeleteCalendar";
import { TeamCalendarKey } from "../controllers/TeamCalendarController";
import { Endpoint } from "./Endpoint";

export const onDeleteCalendar: Endpoint = ({ commonEventObject }) => {
  const key = commonEventObject.parameters?.calendarKey;
  if (!key || !TeamCalendarKey.is(key)) return;

  return CardService.newActionResponseBuilder()
    .setNavigation(CardService.newNavigation().pushCard(ConfirmDeleteCalendarCard(key)))
    .build();
};

export function DeleteCalendarAction(calendarKey: TeamCalendarKey) {
  return CardService.newAction()
    .setFunctionName(onDeleteCalendar.name)
    .setParameters({ calendarKey });
}
