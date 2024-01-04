import { LinkedCalendarController } from "../controllers/LinkedCalendarController";
import { TeamCalendarController } from "../controllers/TeamCalendarController";
import { DeleteCalendarAction } from "../endpoints/onDeleteCalendar";
import { PopulateCalendarsAction } from "../endpoints/onPopulateCalendars";
import { RecreateLinkedCalendarAction } from "../endpoints/onRecreateLinkedCalendar";
import { RefreshCalendarViewAction } from "../endpoints/onRefreshCalendarView";
import { StartUpdateCalendarAction } from "../endpoints/onStartUpdateCalendar";
import { NameFormat, SyncStatus, TeamCalendar } from "../models/TeamCalendar";
import { TeamCalendarId } from "../models/TeamCalendarId";
import { googleCalendarSettingsUrl } from "./utils/googleCalendar";
import { syncStatusText } from "./utils/teamCalendar";

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

function CalendarStatusSection(calendarId: TeamCalendarId, status: SyncStatus) {
  const section = CardService.newCardSection().setHeader("Status");
  const text = CardService.newDecoratedText().setText(syncStatusText(status));
  const buttons = CardService.newButtonSet();

  switch (status.state) {
    case "error":
      buttons.addButton(
        CardService.newTextButton().setText("Retry").setOnClickAction(PopulateCalendarsAction()),
      );
      break;

    case "pending":
      text.setBottomLabel("Syncing can take a few minutes.");
      break;

    case "success":
      text.setBottomLabel("Calendars automatically sync once per week.");
      buttons.addButton(
        CardService.newTextButton()
          .setText("Sync now")
          .setOnClickAction(RecreateLinkedCalendarAction(calendarId)),
      );
      break;
  }

  buttons.addButton(
    CardService.newTextButton()
      .setText("Refresh status")
      .setOnClickAction(RefreshCalendarViewAction(calendarId)),
  );

  return section.addWidget(text).addWidget(buttons);
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
    .addWidget(
      CardService.newDecoratedText()
        .setTopLabel("Team member name format")
        .setText(NameFormat.labels[calendar.nameFormat]),
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

export function CalendarCard(id: TeamCalendarId, calendar = TeamCalendarController.read(id)) {
  if (!calendar) throw new Error("Calendar not found. Maybe it was deleted?");

  return CardService.newCardBuilder()
    .setHeader(CalendarHeader(calendar))
    .addSection(CalendarStatusSection(id, calendar.syncStatus))
    .addSection(CalendarSettingsSection(id, calendar))
    .addSection(LinkedCalendarSection(id, calendar))
    .build();
}
