import { TeamCalendarController } from "../controllers/TeamCalendarController";
import { TeamCalendarKey } from "../models/TeamCalendarKey";
import { Endpoint } from "./Endpoint";
import { GoHomeNavigation } from "./onGoHome";

export const onConfirmDeleteCalendar: Endpoint = ({ commonEventObject }) => {
  const key = TeamCalendarKey.fromParameters(commonEventObject.parameters);
  if (!key) throw new Error("Cannot delete calendar without key");

  TeamCalendarController.delete(key);

  return CardService.newActionResponseBuilder()
    .setNotification(CardService.newNotification().setText("Calendar deleted"))
    .setNavigation(GoHomeNavigation())
    .build();
};

export function ConfirmDeleteCalendarAction(calendarKey: TeamCalendarKey) {
  return CardService.newAction()
    .setFunctionName(onConfirmDeleteCalendar.name)
    .setParameters(TeamCalendarKey.toParameters(calendarKey));
}
