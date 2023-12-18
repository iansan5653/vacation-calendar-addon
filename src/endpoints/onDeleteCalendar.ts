import { ConfirmDeleteCalendarCard } from "../cards/ConfirmDeleteCalendar";
import { TeamCalendarKey } from "../models/TeamCalendarKey";
import { Endpoint } from "./utils/Endpoint";
import { CalendarKeyParameters } from "./utils/Parameters";

export const onDeleteCalendar: Endpoint = ({ commonEventObject }) => {
  const key = new CalendarKeyParameters(commonEventObject.parameters).getCalendarKey();
  if (!key) throw new Error("Cannot delete calendar without key");

  return CardService.newActionResponseBuilder()
    .setNavigation(CardService.newNavigation().pushCard(ConfirmDeleteCalendarCard(key)))
    .build();
};

export function DeleteCalendarAction(calendarKey: TeamCalendarKey) {
  return CardService.newAction()
    .setFunctionName(onDeleteCalendar.name)
    .setParameters(new CalendarKeyParameters().setCalendarKey(calendarKey).build());
}
