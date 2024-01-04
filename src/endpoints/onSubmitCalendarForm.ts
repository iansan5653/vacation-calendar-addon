import { CalendarCard } from "../cards/Calendar";
import { TeamCalendarController } from "../controllers/TeamCalendarController";
import { NameFormat } from "../models/TeamCalendar";
import { TeamCalendarId } from "../models/TeamCalendarId";
import { queuePopulateCalendars } from "./onPopulateCalendars";
import { Endpoint } from "./utils/Endpoint";
import { TeamCalendarIdParameters } from "./utils/Parameters";

// TODO: move logic to job

export const onSubmitCalendarForm: Endpoint = ({ commonEventObject }) => {
  let teamCalendarId = new TeamCalendarIdParameters(commonEventObject.parameters).getId();
  const isUpdate = !!teamCalendarId;

  const name = commonEventObject.formInputs[calendarFormFields.name]?.stringInputs?.value[0] ?? "";
  if (!name) throw new Error("Calendar name is required.");

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

  const nameFormatStr =
    commonEventObject.formInputs[calendarFormFields.nameFormat]?.stringInputs?.value[0];
  const nameFormat = nameFormatStr && NameFormat.is(nameFormatStr) ? nameFormatStr : "name";

  let teamCalendar;
  if (teamCalendarId) {
    teamCalendar = TeamCalendarController.update(teamCalendarId, {
      name,
      teamMembers,
      minEventDuration,
    });
  } else {
    const result = TeamCalendarController.create({
      name,
      teamMembers,
      minEventDuration,
      nameFormat,
      syncStatus: {
        state: "pending",
        timestamp: new Date(),
      },
    });
    teamCalendar = result.calendar;
    teamCalendarId = result.id;
  }

  queuePopulateCalendars({ seconds: 1 });

  return CardService.newActionResponseBuilder()
    .setNotification(
      CardService.newNotification().setText(
        isUpdate ? "Calendar updated." : "Calendar created. Events will appear in a few minutes.",
      ),
    )
    .setNavigation(
      CardService.newNavigation()
        .popCard()
        .updateCard(CalendarCard(teamCalendarId, teamCalendar, !isUpdate)),
    )
    .build();
};

export const calendarFormFields = {
  name: "name",
  teamMembers: "teamMembers",
  minEventDuration: "minEventDuration",
  nameFormat: "nameFormat",
};

export function SubmitUpdateCalendarFormAction(teamCalendarId?: TeamCalendarId) {
  return CardService.newAction()
    .setFunctionName(onSubmitCalendarForm.name)
    .setParameters(new TeamCalendarIdParameters().setId(teamCalendarId).build());
}
