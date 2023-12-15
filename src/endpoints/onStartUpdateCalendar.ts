import { CalendarFormCard } from "../cards/CalendarForm";
import { TeamCalendarController, TeamCalendarKey } from "../controllers/TeamCalendarController";
import { Endpoint } from "./Endpoint";

export const onStartUpdateCalendar: Endpoint = ({ commonEventObject }) => {
  const key = commonEventObject.parameters?.calendarKey;

  const calendar = key && TeamCalendarKey.is(key) ? TeamCalendarController.read(key) : undefined;

  const navigation = CardService.newNavigation().pushCard(
    CalendarFormCard(calendar ? { key: key as TeamCalendarKey, value: calendar } : undefined),
  );

  return CardService.newActionResponseBuilder().setNavigation(navigation).build();
};

export function StartUpdateCalendarAction(calendarKey?: TeamCalendarKey) {
  return CardService.newAction()
    .setFunctionName(onStartUpdateCalendar.name)
    .setParameters(calendarKey ? { calendarKey } : {});
}
