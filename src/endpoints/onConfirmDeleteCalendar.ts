import { LinkedCalendarController } from "../controllers/LinkedCalendarController";
import { TeamCalendarController } from "../controllers/TeamCalendarController";
import { TeamCalendarId } from "../models/TeamCalendarId";
import { GoHomeNavigation } from "./onGoHome";
import { Endpoint } from "./utils/Endpoint";
import { TeamCalendarIdParameters as TeamCalendarIdParameters } from "./utils/Parameters";

export const deleteCalendarFormFields = {
  deleteLinkedCalendar: "deleteLinkedCalendar",
};

export const onConfirmDeleteCalendar: Endpoint = ({ commonEventObject }) => {
  const teamCalendarId = new TeamCalendarIdParameters(commonEventObject.parameters).getId();
  if (!teamCalendarId) throw new Error("Missing parameter: Cannot delete calendar without ID");

  const deleteLinkedCalendar =
    (commonEventObject.formInputs?.[deleteCalendarFormFields.deleteLinkedCalendar]?.stringInputs
      ?.value.length ?? 0) > 0;

  if (deleteLinkedCalendar) {
    const googleCalendarId = TeamCalendarController.read(teamCalendarId)?.googleCalendarId;
    if (googleCalendarId) LinkedCalendarController.delete(googleCalendarId);
  }

  TeamCalendarController.delete(teamCalendarId);

  return CardService.newActionResponseBuilder()
    .setNotification(CardService.newNotification().setText("Calendar deleted"))
    .setNavigation(GoHomeNavigation())
    .build();
};

export function ConfirmDeleteCalendarAction(teamCalendarId: TeamCalendarId) {
  return CardService.newAction()
    .setFunctionName(onConfirmDeleteCalendar.name)
    .setParameters(new TeamCalendarIdParameters().setId(teamCalendarId).build());
}
