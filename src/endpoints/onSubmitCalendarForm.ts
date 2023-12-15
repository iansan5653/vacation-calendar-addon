import { TeamCalendarController, TeamCalendarKey } from "../controllers/TeamCalendarController";
import { Endpoint } from "./Endpoint";

export const onSubmitCalendarForm: Endpoint = ({ commonEventObject }) => {
  const name = commonEventObject.formInputs[calendarFormFields.name]?.stringInputs?.value[0] ?? "";

  const teamMembers =
    commonEventObject.formInputs[calendarFormFields.teamMembers]?.stringInputs?.value[0]?.split(
      "\n",
    ) ?? [];

  // FIXME: Update calendar instead of creating a new one
  TeamCalendarController.create({ name, teamMembers });

  return CardService.newActionResponseBuilder()
    .setNotification(CardService.newNotification().setText("Calendar created"))
    .setNavigation(CardService.newNavigation().popToRoot())
    .build();
};

export const calendarFormFields = {
  name: "name",
  teamMembers: "teamMembers",
};

export function SubmitUpdateCalendarFormAction(calendarKey?: TeamCalendarKey) {
  return CardService.newAction()
    .setFunctionName(onSubmitCalendarForm.name)
    .setParameters(calendarKey ? { calendarKey } : {});
}
