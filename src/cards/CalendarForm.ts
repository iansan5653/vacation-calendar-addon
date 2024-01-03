import { GoBackAction } from "../endpoints/onGoBack";
import {
  SubmitUpdateCalendarFormAction,
  calendarFormFields,
} from "../endpoints/onSubmitCalendarForm";
import { TeamCalendar } from "../models/TeamCalendar";
import { TeamCalendarId } from "../models/TeamCalendarId";

function CalendarNameInput(value?: string) {
  return CardService.newTextInput()
    .setFieldName(calendarFormFields.name)
    .setTitle("Calendar name")
    .setValue(value ?? "");
}

function TeamMembersInput(value?: string[]) {
  return CardService.newTextInput()
    .setMultiline(true)
    .setFieldName(calendarFormFields.teamMembers)
    .setTitle("Team members")
    .setHint("Enter one email address per line")
    .setValue(value?.join("\n") ?? "");
}

function MinDurationInput(value?: string) {
  return CardService.newTextInput()
    .setFieldName(calendarFormFields.minEventDuration)
    .setTitle("Minimum event duration")
    .setHint("Minimum duration of events to copy, in hours")
    .setValue(value ?? "4");
}

function SubmitButton(teamCalendarId?: TeamCalendarId) {
  return CardService.newTextButton()
    .setText("Submit")
    .setOnClickAction(SubmitUpdateCalendarFormAction(teamCalendarId));
}

function CancelButton() {
  return CardService.newTextButton().setText("Cancel").setOnClickAction(GoBackAction());
}

export function CalendarFormCard(calendar?: { id: TeamCalendarId; calendar: TeamCalendar }) {
  const title = calendar?.calendar ? `Edit "${calendar.calendar.name}"` : "New calendar";

  const buttons = CardService.newButtonSet()
    .addButton(SubmitButton(calendar?.id))
    .addButton(CancelButton());

  return CardService.newCardBuilder()
    .setName(CalendarFormCard.name)
    .setHeader(CardService.newCardHeader().setTitle(title))
    .addSection(
      CardService.newCardSection()
        .addWidget(CalendarNameInput(calendar?.calendar.name))
        .addWidget(TeamMembersInput(calendar?.calendar.teamMembers))
        .addWidget(MinDurationInput(calendar?.calendar.minEventDuration?.toString(10)))
        .addWidget(buttons),
    )
    .build();
}
