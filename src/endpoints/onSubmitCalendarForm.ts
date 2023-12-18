import { TeamCalendarController } from "../controllers/TeamCalendarController";
import { TeamCalendarKey } from "../models/TeamCalendarKey";
import { Endpoint } from "./utils/Endpoint";
import { GoHomeNavigation } from "./onGoHome";
import { CalendarKeyParameters } from "./utils/Parameters";
import { populateCalendar } from "../jobs/populateCalendar";

export const onSubmitCalendarForm: Endpoint = ({ commonEventObject }) => {
  const key = new CalendarKeyParameters(commonEventObject.parameters).getCalendarKey();

  const name = commonEventObject.formInputs[calendarFormFields.name]?.stringInputs?.value[0] ?? "";

  const teamMembers =
    commonEventObject.formInputs[calendarFormFields.teamMembers]?.stringInputs?.value[0]?.split(
      "\n",
    ) ?? [];

  if (key) {
    TeamCalendarController.update(key, { name, teamMembers });

    populateCalendar(key); // FIXME: Don't update on update

    return CardService.newActionResponseBuilder()
      .setNotification(CardService.newNotification().setText("Calendar saved"))
      .setNavigation(GoHomeNavigation())
      .build();
  } else {
    const { key } = TeamCalendarController.create({ name, teamMembers });

    populateCalendar(key);

    return CardService.newActionResponseBuilder()
      .setNotification(CardService.newNotification().setText("Calendar created"))
      .setNavigation(GoHomeNavigation())
      .build();
  }
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
