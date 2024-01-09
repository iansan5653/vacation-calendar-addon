import { differenceInMinutes } from "date-fns";
import { LinkedCalendarController } from "../controllers/LinkedCalendarController";
import { TeamCalendarController } from "../controllers/TeamCalendarController";
import { DeleteCalendarAction } from "../endpoints/onDeleteCalendar";
import { RecreateLinkedCalendarAction } from "../endpoints/onRecreateLinkedCalendar";
import { RefreshCalendarViewAction } from "../endpoints/onRefreshCalendarView";
import { StartUpdateCalendarAction } from "../endpoints/onStartUpdateCalendar";
import { NameFormat, SyncStatus, TeamCalendar } from "../models/TeamCalendar";
import { TeamCalendarId } from "../models/TeamCalendarId";
import { formatGoogleCalendarName, googleCalendarSettingsUrl } from "./utils/googleCalendar";
import { syncStatusText } from "./utils/teamCalendar";
import { QueueFullSyncAllCalendarsAction } from "../endpoints/onQueueFullSyncCalendar";

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

  if (status.state === "rebuilding" && differenceInMinutes(status.timestamp, new Date()) > 5)
    status = { state: "error", message: "Exceeded time limit", timestamp: status.timestamp };

  switch (status.state) {
    case "error":
      buttons.addButton(
        CardService.newTextButton()
          .setText("Retry")
          .setOnClickAction(QueueFullSyncAllCalendarsAction(calendarId)),
      );
      break;

    case "rebuilding":
      text.setBottomLabel("Rebuilding can take up to five minutes.");
      break;

    case "building":
      text.setBottomLabel("Building a new calendar can take up to five minutes.");
      break;

    case "success":
      text.setBottomLabel(
        "Calendars update automatically, but if this isn't working a full rebuild may be necessary. A full rebuild will replace all events on the calendar.",
      );
      buttons.addButton(
        CardService.newTextButton()
          .setText("Rebuild now")
          .setOnClickAction(QueueFullSyncAllCalendarsAction(calendarId)),
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
        .setText(
          Object.keys(calendar.teamMembers)
            .map((e) => ` - ${e}`)
            .join("\n"),
        ),
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

function LinkedCalendarSection(calendarId: TeamCalendarId, calendar: TeamCalendar, isNew: boolean) {
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

  const text = CardService.newDecoratedText().setText(formatGoogleCalendarName(googleCalendar));

  if (isNew) text.setBottomLabel("Refresh the page to see this calendar");

  return section.addWidget(text).addWidget(
    CardService.newTextButton()
      .setText("Sharing and settings")
      .setOpenLink(CardService.newOpenLink().setUrl(googleCalendarSettingsUrl(googleCalendar))),
  );
}

export function CalendarCard(
  id: TeamCalendarId,
  calendar = TeamCalendarController.read(id),
  isNewGoogleCalendar = false,
) {
  if (!calendar) throw new Error("Calendar not found. Maybe it was deleted?");

  return CardService.newCardBuilder()
    .setHeader(CalendarHeader(calendar))
    .addSection(CalendarStatusSection(id, calendar.syncStatus))
    .addSection(LinkedCalendarSection(id, calendar, isNewGoogleCalendar))
    .addSection(CalendarSettingsSection(id, calendar))
    .build();
}
