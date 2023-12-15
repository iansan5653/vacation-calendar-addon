import { onStartCreateCalendar } from "..";

function IntroParagraph() {
  return CardService.newTextParagraph().setText(
    "You don't have any calendars yet. Get started by creating a new one.",
  );
}

function CreateEventButton() {
  return CardService.newTextButton()
    .setText("New calendar")
    .setOnClickAction(CardService.newAction().setFunctionName(onStartCreateCalendar.name));
}

export function HomeCard() {
  const header = CardService.newCardHeader().setTitle("Your team calendars");

  const body = CardService.newCardSection()
    .addWidget(IntroParagraph())
    .addWidget(CreateEventButton());

  return CardService.newCardBuilder()
    .setName(HomeCard.name)
    .setHeader(header)
    .addSection(body)
    .build();
}
