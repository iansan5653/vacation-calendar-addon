import { LinkedCalendarController } from "../controllers/LinkedCalendarController";
import { DeleteCalendarAction } from "../endpoints/onDeleteCalendar";
import { RecreateLinkedCalendarAction } from "../endpoints/onRecreateLinkedCalendar";
import { StartUpdateCalendarAction } from "../endpoints/onStartUpdateCalendar";
import { TeamCalendar } from "../models/TeamCalendar";
import { TeamCalendarId } from "../models/TeamCalendarId";
import { googleCalendarSettingsUrl } from "./utils/googleCalendar";

function CalendarHeader(calendar: TeamCalendar) {
  return CardService.newCardHeader().setTitle(calendar.name);
}

function CalendarActions(teamCalendarId: TeamCalendarId) {
  return CardService.newButtonSet()
    .addButton(
      CardService.newTextButton()
        .setText("Edit")
        .setOnClickAction(StartUpdateCalendarAction(teamCalendarId)),
    )
    .addButton(
      CardService.newTextButton()
        .setText("Delete")
        .setOnClickAction(DeleteCalendarAction(teamCalendarId)),
    );
}

function CalendarSettingsSection(calendarId: TeamCalendarId, calendar: TeamCalendar) {
  return CardService.newCardSection()
    .setHeader("Settings")
    .addWidget(CardService.newDecoratedText().setTopLabel("Name").setText(calendar.name))
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
    .addWidget(CalendarActions(calendarId));
}

function LinkedCalendarSection(calendarId: TeamCalendarId, calendar: TeamCalendar) {
  const section = CardService.newCardSection().setHeader("Linked Google calendar");

  const googleCalendar = LinkedCalendarController.read(calendar.googleCalendarId);
  if (!googleCalendar) {
    return section
      .addWidget(
        CardService.newTextParagraph().setText(
          "⚠️ No linked calendar found. Maybe it was deleted?",
        ),
      )
      .addWidget(
        CardService.newTextButton()
          .setText("Recreate")
          .setOnClickAction(RecreateLinkedCalendarAction(calendarId)),
      );
  }

  return section
    .addWidget(
      CardService.newDecoratedText()
        .setText(
          `<b><font color="${googleCalendar.getColor()}">⬤</font> ${googleCalendar.getName()}</b>`,
        )
        .setBottomLabel("Events will be added to this calendar."),
    )
    .addWidget(
      CardService.newTextButton()
        .setText("Sharing and settings")
        .setOpenLink(CardService.newOpenLink().setUrl(googleCalendarSettingsUrl(googleCalendar))),
    );
}

export function CalendarCard(id: TeamCalendarId, calendar: TeamCalendar) {
  return CardService.newCardBuilder()
    .setHeader(CalendarHeader(calendar))
    .addSection(CalendarSettingsSection(id, calendar))
    .addSection(LinkedCalendarSection(id, calendar))
    .build();
}
