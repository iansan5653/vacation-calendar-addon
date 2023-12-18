import { TeamCalendarsController } from "../controllers/TeamCalendarsController";
import { StartUpdateCalendarAction } from "../endpoints/onStartUpdateCalendar";
import { TeamCalendar } from "../models/TeamCalendar";
import { TeamCalendarKey } from "../models/TeamCalendarKey";

function CreateButton() {
  return CardService.newTextButton()
    .setText("New calendar")
    .setOnClickAction(StartUpdateCalendarAction());
}

function CalendarEntry(key: TeamCalendarKey, { name }: TeamCalendar) {
  return CardService.newDecoratedText()
    .setText(name)
    .setButton(
      CardService.newTextButton().setText("Edit").setOnClickAction(StartUpdateCalendarAction(key)),
    );
}

function calendarItems() {
  const calendars = TeamCalendarsController.read().map(([key, calendar]) =>
    CalendarEntry(key, calendar),
  );
  return calendars.length > 0
    ? calendars
    : [
        CardService.newTextParagraph().setText(
          "You don't have any team calendars yet. Get started by creating a new one.",
        ),
      ];
}

export function HomeCard() {
  const header = CardService.newCardHeader().setTitle("Your team calendars");

  let body = CardService.newCardSection();
  for (const item of calendarItems()) {
    body = body.addWidget(item);
  }
  body = body.addWidget(CreateButton());

  return CardService.newCardBuilder()
    .setName(HomeCard.name)
    .setHeader(header)
    .addSection(body)
    .build();
}
