import { TeamCalendar, TeamCalendarKey } from "../controllers/TeamCalendarController";
import { SubmitUpdateCalendarFormAction } from "../global-functions/onSubmitCalendarForm";

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

export const calendarFormFields = {
  name: "name",
  teamMembers: "teamMembers",
};

export function CalendarFormCard(calendar?: { key: TeamCalendarKey; value: TeamCalendar }) {
  const title = calendar?.value ? `Edit "${calendar.value.name}"` : "New calendar";

  return CardService.newCardBuilder()
    .setName(CalendarFormCard.name)
    .setHeader(CardService.newCardHeader().setTitle(title))
    .addSection(
      CardService.newCardSection()
        .addWidget(CalendarNameInput(calendar?.value.name))
        .addWidget(TeamMembersInput(calendar?.value.teamMembers))
        .addWidget(SubmitButton(calendar?.key)),
    )
    .build();
}
