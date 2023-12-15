import { TeamCalendarController, TeamCalendarKey } from "../controllers/TeamCalendarController";
import { Endpoint } from "./Endpoint";

export const onConfirmDeleteCalendar: Endpoint = ({ commonEventObject }) => {
  const key = commonEventObject.parameters?.calendarKey;
  if (!key || !TeamCalendarKey.is(key)) return;

  TeamCalendarController.delete(key);

  return CardService.newActionResponseBuilder()
    .setNotification(CardService.newNotification().setText("Calendar deleted"))
    .setNavigation(CardService.newNavigation().popToRoot())
    .build();
};

export function ConfirmDeleteCalendarAction(calendarKey: TeamCalendarKey) {
  return CardService.newAction()
    .setFunctionName(onConfirmDeleteCalendar.name)
    .setParameters({ calendarKey });
}
