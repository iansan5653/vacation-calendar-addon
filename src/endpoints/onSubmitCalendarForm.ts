import { CalendarCard } from "../cards/Calendar";
import { createCalendar } from "../jobs/createCalendar";
import { updateCalendar } from "../jobs/updateCalendar";
import { NameFormat } from "../models/TeamCalendar";
import { TeamCalendarId } from "../models/TeamCalendarId";
import { Endpoint } from "./utils/Endpoint";
import { TeamCalendarIdParameters } from "./utils/Parameters";

export const onSubmitCalendarForm: Endpoint = ({ commonEventObject }) => {
  let teamCalendarId = new TeamCalendarIdParameters(commonEventObject.parameters).getId();
  const isUpdate = !!teamCalendarId;

  const name =
    commonEventObject.formInputs?.[calendarFormFields.name]?.stringInputs?.value[0] ?? "";
  if (!name) throw new Error("Calendar name is required.");

  const teamMembers = Object.fromEntries(
    commonEventObject.formInputs?.[calendarFormFields.teamMembers]?.stringInputs?.value[0]
      ?.split("\n")
      ?.map((email) => [email, { eventIds: {} }] as const) ?? [],
  );

  const minEventDurationStr =
    commonEventObject.formInputs?.[calendarFormFields.minEventDuration]?.stringInputs?.value[0] ??
    "4";
  const minEventDuration = parseInt(minEventDurationStr, 10);
  if (Number.isNaN(minEventDuration))
    throw new Error(
      `Invalid minimum event duration: ${minEventDurationStr}. Must be a number greater than 0.`,
    );

  const nameFormatStr =
    commonEventObject.formInputs?.[calendarFormFields.nameFormat]?.stringInputs?.value[0];
  const nameFormat = nameFormatStr && NameFormat.is(nameFormatStr) ? nameFormatStr : "name";

  let teamCalendar;
  if (teamCalendarId) {
    teamCalendar = updateCalendar(teamCalendarId, {
      name,
      teamMembers,
      minEventDuration,
    });
  } else {
    const result = createCalendar({
      name,
      teamMembers,
      minEventDuration,
      nameFormat,
    });
    teamCalendar = result.calendar;
    teamCalendarId = result.id;
  }

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
