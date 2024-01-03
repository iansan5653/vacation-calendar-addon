import { DeleteCalendarAction } from "../endpoints/onDeleteCalendar";
import { StartUpdateCalendarAction } from "../endpoints/onStartUpdateCalendar";
import { TeamCalendar } from "../models/TeamCalendar";
import { TeamCalendarKey } from "../models/TeamCalendarKey";

function CalendarHeader(calendar: TeamCalendar) {
  return CardService.newCardHeader().setTitle(calendar.name);
}

function CalendarActions(key: TeamCalendarKey) {
  return CardService.newButtonSet()
    .addButton(
      CardService.newTextButton().setText("Edit").setOnClickAction(StartUpdateCalendarAction(key)),
    )
    .addButton(
      CardService.newTextButton().setText("Delete").setOnClickAction(DeleteCalendarAction(key)),
    );
}

function CalendarSettingsSection(key: TeamCalendarKey, calendar: TeamCalendar) {
  return CardService.newCardSection()
    .setHeader("Settings")
    .addWidget(
      CardService.newKeyValue()
        .setTopLabel("Team members")
        .setContent(calendar.teamMembers.map((e) => ` - ${e}`).join("\n")),
    )
    .addWidget(
      CardService.newKeyValue()
        .setTopLabel("Minimum event duration")
        .setContent(`${calendar.minEventDuration} hours`),
    )
    .addWidget(CalendarActions(key));
}

export function CalendarCard(key: TeamCalendarKey, calendar: TeamCalendar) {
  return CardService.newCardBuilder()
    .setHeader(CalendarHeader(calendar))
    .addSection(CalendarSettingsSection(key, calendar))
    .build();
}
