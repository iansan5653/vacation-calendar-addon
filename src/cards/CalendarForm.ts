import { TeamCalendar, TeamCalendarKey } from "../controllers/TeamCalendarController";
import { DeleteCalendarAction } from "../endpoints/onDeleteCalendar";
import {
  SubmitUpdateCalendarFormAction,
  calendarFormFields,
} from "../endpoints/onSubmitCalendarForm";

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

function SubmitButton(key?: TeamCalendarKey) {
  return CardService.newTextButton()
    .setText("Submit")
    .setOnClickAction(SubmitUpdateCalendarFormAction(key));
}

function DeleteButton(key: TeamCalendarKey) {
  return CardService.newTextButton()
    .setText("Delete")
    .setBackgroundColor("#ff0000")
    .setOnClickAction(DeleteCalendarAction(key));
}

export function CalendarFormCard(calendar?: { key: TeamCalendarKey; value: TeamCalendar }) {
  const title = calendar?.value ? `Edit "${calendar.value.name}"` : "New calendar";

  const buttons = CardService.newButtonSet().addButton(SubmitButton(calendar?.key));
  if (calendar?.key) buttons.addButton(DeleteButton(calendar.key));

  return CardService.newCardBuilder()
    .setName(CalendarFormCard.name)
    .setHeader(CardService.newCardHeader().setTitle(title))
    .addSection(
      CardService.newCardSection()
        .addWidget(CalendarNameInput(calendar?.value.name))
        .addWidget(TeamMembersInput(calendar?.value.teamMembers))
        .addWidget(buttons),
    )
    .build();
}
