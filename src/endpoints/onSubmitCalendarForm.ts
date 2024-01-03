import { TeamCalendarController } from "../controllers/TeamCalendarController";
import { TeamCalendarId } from "../models/TeamCalendarId";
import { Endpoint } from "./utils/Endpoint";
import { GoHomeNavigation } from "./onGoHome";
import { TeamCalendarIdParameters } from "./utils/Parameters";
import { QueueController } from "../controllers/QueueController";
import { onPopulateCalendars } from "./onPopulateCalendars";

export const onSubmitCalendarForm: Endpoint = ({ commonEventObject }) => {
  let teamCalendarId = new TeamCalendarIdParameters(commonEventObject.parameters).getId();
  const isUpdate = !!teamCalendarId;

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

  if (teamCalendarId) {
    TeamCalendarController.update(teamCalendarId, { name, teamMembers, minEventDuration });
  } else {
    teamCalendarId = TeamCalendarController.create({ name, teamMembers, minEventDuration }).id;
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

export function SubmitUpdateCalendarFormAction(teamCalendarId?: TeamCalendarId) {
  return CardService.newAction()
    .setFunctionName(onSubmitCalendarForm.name)
    .setParameters(new TeamCalendarIdParameters().setId(teamCalendarId).build());
}
