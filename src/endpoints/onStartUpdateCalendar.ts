import { CalendarFormCard } from "../cards/CalendarForm";
import { TeamCalendarController } from "../controllers/TeamCalendarController";
import { TeamCalendarKey } from "../models/TeamCalendarKey";
import { Endpoint } from "./utils/Endpoint";
import { CalendarKeyParameters } from "./utils/Parameters";

export const onStartUpdateCalendar: Endpoint = ({ commonEventObject }) => {
  const key = new CalendarKeyParameters(commonEventObject.parameters).getCalendarKey();

  const calendar = key ? TeamCalendarController.read(key) : undefined;

  const args = key && calendar ? { key, calendar } : undefined;

  const navigation = CardService.newNavigation().pushCard(CalendarFormCard(args));

  return CardService.newActionResponseBuilder().setNavigation(navigation).build();
};

export function StartUpdateCalendarAction(calendarKey?: TeamCalendarKey) {
  return CardService.newAction()
    .setFunctionName(onStartUpdateCalendar.name)
    .setParameters(new CalendarKeyParameters().setCalendarKey(calendarKey).build());
}
