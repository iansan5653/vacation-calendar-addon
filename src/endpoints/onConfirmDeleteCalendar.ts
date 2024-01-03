import { LinkedCalendarController } from "../controllers/LinkedCalendarController";
import { TeamCalendarController } from "../controllers/TeamCalendarController";
import { TeamCalendarId } from "../models/TeamCalendarId";
import { GoHomeNavigation } from "./onGoHome";
import { Endpoint } from "./utils/Endpoint";
import { CalendarKeyParameters } from "./utils/Parameters";

export const deleteCalendarFormFields = {
  deleteLinkedCalendar: "deleteLinkedCalendar",
};

export const onConfirmDeleteCalendar: Endpoint = ({ commonEventObject }) => {
  const key = new CalendarKeyParameters(commonEventObject.parameters).getCalendarKey();
  if (!key) throw new Error("Missing parameter: Cannot delete calendar without key");

  const deleteLinkedCalendar =
    (commonEventObject.formInputs[deleteCalendarFormFields.deleteLinkedCalendar]?.stringInputs
      ?.value.length ?? 0) > 0;

  if (deleteLinkedCalendar) {
    const googleCalendarId = TeamCalendarController.read(key)?.googleCalendarId;
    if (googleCalendarId) LinkedCalendarController.delete(googleCalendarId);
  }

  TeamCalendarController.delete(key);

  return CardService.newActionResponseBuilder()
    .setNotification(CardService.newNotification().setText("Calendar deleted"))
    .setNavigation(GoHomeNavigation())
    .build();
};

export function ConfirmDeleteCalendarAction(calendarKey: TeamCalendarId) {
  return CardService.newAction()
    .setFunctionName(onConfirmDeleteCalendar.name)
    .setParameters(new CalendarKeyParameters().setCalendarKey(calendarKey).build());
}
