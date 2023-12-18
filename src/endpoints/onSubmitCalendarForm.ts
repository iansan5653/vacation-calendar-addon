import { TeamCalendarController } from "../controllers/TeamCalendarController";
import { TeamCalendarKey } from "../models/TeamCalendarKey";
import { Endpoint } from "./Endpoint";
import { GoHomeNavigation } from "./onGoHome";

export const onSubmitCalendarForm: Endpoint = ({ commonEventObject }) => {
  const key = TeamCalendarKey.fromParameters(commonEventObject.parameters);

  const name = commonEventObject.formInputs[calendarFormFields.name]?.stringInputs?.value[0] ?? "";

  const teamMembers =
    commonEventObject.formInputs[calendarFormFields.teamMembers]?.stringInputs?.value[0]?.split(
      "\n",
    ) ?? [];

  if (key) {
    TeamCalendarController.update(key, { name, teamMembers });
  } else {
    TeamCalendarController.create({ name, teamMembers });
  }

  return CardService.newActionResponseBuilder()
    .setNotification(CardService.newNotification().setText("Calendar created"))
    .setNavigation(GoHomeNavigation())
    .build();
};

export const calendarFormFields = {
  name: "name",
  teamMembers: "teamMembers",
};

export function SubmitUpdateCalendarFormAction(calendarKey?: TeamCalendarKey) {
  return CardService.newAction()
    .setFunctionName(onSubmitCalendarForm.name)
    .setParameters(TeamCalendarKey.toParameters(calendarKey));
}
