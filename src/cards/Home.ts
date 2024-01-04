import { TeamCalendarsController } from "../controllers/TeamCalendarsController";
import { OnClickCalendarGridItemAction } from "../endpoints/onClickCalendarGridItem";
import { GoHomeAction } from "../endpoints/onGoHome";
import { StartUpdateCalendarAction } from "../endpoints/onStartUpdateCalendar";
import { TeamCalendar } from "../models/TeamCalendar";
import { TeamCalendarId } from "../models/TeamCalendarId";
import { syncStatusText } from "./utils/teamCalendar";

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

function CalendarGridItem(id: TeamCalendarId, { name, syncStatus }: TeamCalendar) {
  return CardService.newGridItem()
    .setIdentifier(id)
    .setTitle(name)
    .setSubtitle(syncStatusText(syncStatus));
}

function CalendarsGrid(calendars: (readonly [TeamCalendarId, TeamCalendar])[]) {
  let grid = CardService.newGrid()
    .setTitle("Your team calendars")
    .setBorderStyle(
      CardService.newBorderStyle().setType(CardService.BorderType.STROKE).setCornerRadius(8),
    )
    .setOnClickAction(OnClickCalendarGridItemAction());
  for (const [id, calendar] of calendars) {
    grid = grid.addItem(CalendarGridItem(id, calendar));
  }
  return grid;
}

function RefreshButton() {
  return CardService.newTextButton().setText("Refresh").setOnClickAction(GoHomeAction());
}

export function HomeCard() {
  const calendars = TeamCalendarsController.read();

  let body = CardService.newCardSection();

  if (calendars.length === 0) {
    body = body.addWidget(EmptyText());
  } else {
    body = body.addWidget(CalendarsGrid(calendars));
  }

  body = body
    .addWidget(CardService.newTextParagraph().setText("Click 'Refresh' to update statuses."))
    .addWidget(CardService.newButtonSet().addButton(CreateButton()).addButton(RefreshButton()));

  return CardService.newCardBuilder().setName(HomeCard.name).addSection(body).build();
}
