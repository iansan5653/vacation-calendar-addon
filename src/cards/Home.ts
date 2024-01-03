import { TeamCalendarsController } from "../controllers/TeamCalendarsController";
import { OnClickCalendarGridItemAction } from "../endpoints/onClickCalendarGridItem";
import { StartUpdateCalendarAction } from "../endpoints/onStartUpdateCalendar";
import { TeamCalendar } from "../models/TeamCalendar";
import { TeamCalendarId } from "../models/TeamCalendarKey";

function CreateButton() {
  return CardService.newTextButton()
    .setText("New calendar")
    .setOnClickAction(StartUpdateCalendarAction());
}

function EmptyText() {
  return CardService.newTextParagraph().setText(
    "You don't have any team calendars yet. Get started by creating a new one.",
  );
}

function CalendarGridItem(key: TeamCalendarId, { name }: TeamCalendar) {
  return CardService.newGridItem().setIdentifier(key).setTitle(name);
}

function CalendarsGrid(calendars: (readonly [TeamCalendarId, TeamCalendar])[]) {
  let grid = CardService.newGrid()
    .setTitle("Your team calendars")
    .setBorderStyle(
      CardService.newBorderStyle().setType(CardService.BorderType.STROKE).setCornerRadius(8),
    )
    .setOnClickAction(OnClickCalendarGridItemAction());
  for (const [key, calendar] of calendars) {
    grid = grid.addItem(CalendarGridItem(key, calendar));
  }
  return grid;
}

export function HomeCard() {
  const calendars = TeamCalendarsController.read();

  let body = CardService.newCardSection();

  if (calendars.length === 0) {
    body = body.addWidget(EmptyText());
  } else {
    body = body.addWidget(CalendarsGrid(calendars));
  }

  body = body.addWidget(CreateButton());

  return CardService.newCardBuilder().setName(HomeCard.name).addSection(body).build();
}
