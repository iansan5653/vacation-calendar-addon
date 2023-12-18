import { TeamCalendarController, TeamCalendarKey } from "../controllers/TeamCalendarController";
import { Endpoint } from "./Endpoint";
import { GoHomeNavigation } from "./onGoHome";

export const onConfirmDeleteCalendar: Endpoint = ({ commonEventObject }) => {
  const key = commonEventObject.parameters?.calendarKey;
  if (!key || !TeamCalendarKey.is(key)) return;

  TeamCalendarController.delete(key);

  return CardService.newActionResponseBuilder()
    .setNotification(CardService.newNotification().setText("Calendar deleted"))
    .setNavigation(GoHomeNavigation())
    .build();
};

export function ConfirmDeleteCalendarAction(calendarKey: TeamCalendarKey) {
  return CardService.newAction()
    .setFunctionName(onConfirmDeleteCalendar.name)
    .setParameters({ calendarKey });
}
