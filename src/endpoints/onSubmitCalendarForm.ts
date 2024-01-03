import { TeamCalendarController } from "../controllers/TeamCalendarController";
import { TeamCalendarId } from "../models/TeamCalendarKey";
import { Endpoint } from "./utils/Endpoint";
import { GoHomeNavigation } from "./onGoHome";
import { CalendarKeyParameters } from "./utils/Parameters";
import { QueueController } from "../controllers/QueueController";
import { onPopulateCalendars } from "./onPopulateCalendars";

export const onSubmitCalendarForm: Endpoint = ({ commonEventObject }) => {
  let key = new CalendarKeyParameters(commonEventObject.parameters).getCalendarKey();
  const isUpdate = !!key;

  const name = commonEventObject.formInputs[calendarFormFields.name]?.stringInputs?.value[0] ?? "";

  const teamMembers =
    commonEventObject.formInputs[calendarFormFields.teamMembers]?.stringInputs?.value[0]?.split(
      "\n",
    ) ?? [];

  const minEventDurationStr =
    commonEventObject.formInputs[calendarFormFields.minEventDuration]?.stringInputs?.value[0] ??
    "4";
  const minEventDuration = parseInt(minEventDurationStr, 10);
  if (Number.isNaN(minEventDuration))
    throw new Error(
      `Invalid minimum event duration: ${minEventDurationStr}. Must be a number greater than 0.`,
    );

  if (key) {
    TeamCalendarController.update(key, { name, teamMembers, minEventDuration });
  } else {
    key = TeamCalendarController.create({ name, teamMembers, minEventDuration }).id;
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
  minEventDuration: "minEventDuration",
};

export function SubmitUpdateCalendarFormAction(calendarKey?: TeamCalendarId) {
  return CardService.newAction()
    .setFunctionName(onSubmitCalendarForm.name)
    .setParameters(new CalendarKeyParameters().setCalendarKey(calendarKey).build());
}
