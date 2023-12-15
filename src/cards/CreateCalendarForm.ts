import { onSubmitCreateCalendar } from "..";

function CalendarNameInput() {
  return CardService.newTextInput()
    .setFieldName(createCalendarFormFields.name)
    .setTitle("Calendar name");
}

function TeamMembersInput() {
  return CardService.newTextInput()
    .setMultiline(true)
    .setFieldName(createCalendarFormFields.teamMembers)
    .setTitle("Team members")
    .setHint("Enter one email address per line");
}

function SubmitButton() {
  return CardService.newTextButton()
    .setText("Submit")
    .setOnClickAction(CardService.newAction().setFunctionName(onSubmitCreateCalendar.name));
}

export const createCalendarFormFields = {
  name: "name",
  teamMembers: "teamMembers",
};

export function CreateCalendarFormCard() {
  return CardService.newCardBuilder()
    .setName(CreateCalendarFormCard.name)
    .setHeader(CardService.newCardHeader().setTitle("New calendar"))
    .addSection(
      CardService.newCardSection()
        .addWidget(CalendarNameInput())
        .addWidget(TeamMembersInput())
        .addWidget(SubmitButton()),
    )
    .build();
}
