import { GoBackAction } from "../endpoints/onGoBack";
import {
  SubmitUpdateCalendarFormAction,
  calendarFormFields,
} from "../endpoints/onSubmitCalendarForm";
import { NameFormat, TeamCalendar } from "../models/TeamCalendar";
import { TeamCalendarId } from "../models/TeamCalendarId";

function CalendarNameInput(editing: boolean, value?: string) {
  const input = CardService.newTextInput()
    .setFieldName(calendarFormFields.name)
    .setTitle("Calendar name")
    .setValue(value ?? "");

  if (editing) input.setHint("Will also update the linked Google calendar name");

  return input;
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

function NameFormatSelector(value: NameFormat = "name") {
  let widget = CardService.newSelectionInput()
    .setFieldName(calendarFormFields.nameFormat)
    .setType(CardService.SelectionInputType.RADIO_BUTTON)
    .setTitle("Team member name format");

  for (const nameFormat of NameFormat.values)
    widget = widget.addItem(NameFormat.labels[nameFormat], nameFormat, nameFormat === value);

  return widget;
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
  const editing = !!calendar;
  const title = editing ? `Edit "${calendar.calendar.name}"` : "New calendar";

  const buttons = CardService.newButtonSet()
    .addButton(SubmitButton(calendar?.id))
    .addButton(CancelButton());

  return CardService.newCardBuilder()
    .setName(CalendarFormCard.name)
    .setHeader(CardService.newCardHeader().setTitle(title))
    .addSection(
      CardService.newCardSection()
        .addWidget(CalendarNameInput(editing, calendar?.calendar.name))
        .addWidget(TeamMembersInput(calendar && Object.keys(calendar.calendar.teamMembers)))
        .addWidget(MinDurationInput(calendar?.calendar.minEventDuration?.toString(10)))
        .addWidget(NameFormatSelector(calendar?.calendar.nameFormat))
        .addWidget(buttons),
    )
    .build();
}
