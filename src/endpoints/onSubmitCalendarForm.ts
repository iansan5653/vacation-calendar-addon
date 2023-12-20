import { TeamCalendarController } from "../controllers/TeamCalendarController";
import { TeamCalendarKey } from "../models/TeamCalendarKey";
import { Endpoint } from "./utils/Endpoint";
import { GoHomeNavigation } from "./onGoHome";
import { CalendarKeyParameters } from "./utils/Parameters";
import { QueueController } from "../controllers/QueueController";
import {onPopulateCalendars} from "./onPopulateCalendars";

export const onSubmitCalendarForm: Endpoint = ({ commonEventObject }) => {
  let key = new CalendarKeyParameters(commonEventObject.parameters).getCalendarKey();
  const isUpdate = !!key;

  const name = commonEventObject.formInputs[calendarFormFields.name]?.stringInputs?.value[0] ?? "";

  const teamMembers =
    commonEventObject.formInputs[calendarFormFields.teamMembers]?.stringInputs?.value[0]?.split(
      "\n",
    ) ?? [];

  if (key) {
    TeamCalendarController.update(key, { name, teamMembers });
  } else {
    key = TeamCalendarController.create({ name, teamMembers }).key;
  }

  QueueController.queueOnce(onPopulateCalendars.name, { seconds: 1 });

  return CardService.newActionResponseBuilder()
    .setNotification(
      CardService.newNotification().setText(
        isUpdate
          ? "Calendar updated."
          : "Calendar created. Refresh the page to see it in your calendars.",
      ),
    )
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
    .setParameters(new CalendarKeyParameters().setCalendarKey(calendarKey).build());
}
