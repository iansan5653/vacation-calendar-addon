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
      CardService.newDecoratedText()
        .setTopLabel("Team members")
        .setText(calendar.teamMembers.map((e) => ` - ${e}`).join("\n")),
    )
    .addWidget(
      CardService.newDecoratedText()
        .setTopLabel("Minimum event duration")
        .setText(`${calendar.minEventDuration} hours`),
    )
    .addWidget(CalendarActions(key));
}

function LinkedCalendarSection(calendar: TeamCalendar) {
  const section = CardService.newCardSection().setHeader("Linked Google calendar");

  let googleCalendar;
  try {
    googleCalendar = CalendarApp.getCalendarById(calendar.googleCalendarId);
  } catch {
    return section.addWidget(
      CardService.newTextParagraph().setText("Calendar not found! Maybe it was deleted?"),
    );
  }

  return section.addWidget(
    CardService.newDecoratedText()
      .setText(
        `<b><font color="${googleCalendar.getColor()}">⬤</font> ${googleCalendar.getName()}</b>`,
      )
      .setBottomLabel(
        "Use the linked calendar's settings (accessible in the left sidebar) to update sharing, notifications, and more.",
      ),
  );
}

export function CalendarCard(key: TeamCalendarKey, calendar: TeamCalendar) {
  return CardService.newCardBuilder()
    .setHeader(CalendarHeader(calendar))
    .addSection(CalendarSettingsSection(key, calendar))
    .addSection(LinkedCalendarSection(calendar))
    .build();
}