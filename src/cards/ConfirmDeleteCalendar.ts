import { LinkedCalendarController } from "../controllers/LinkedCalendarController";
import { TeamCalendarController } from "../controllers/TeamCalendarController";
import {
  ConfirmDeleteCalendarAction,
  deleteCalendarFormFields,
} from "../endpoints/onConfirmDeleteCalendar";
import { GoBackAction } from "../endpoints/onGoBack";
import { TeamCalendarId } from "../models/TeamCalendarId";
import { formatGoogleCalendarName } from "./utils/formatGoogleCalendarName";

function ConfirmButton(teamCalendarId: TeamCalendarId) {
  return CardService.newTextButton()
    .setText("Delete")
    .setOnClickAction(ConfirmDeleteCalendarAction(teamCalendarId));
}

function CancelButton() {
  return CardService.newTextButton().setText("Cancel").setOnClickAction(GoBackAction());
}

function DeleteGoogleCalendarSwitch() {
  return CardService.newSwitch()
    .setControlType(CardService.SwitchControlType.CHECK_BOX)
    .setFieldName(deleteCalendarFormFields.deleteLinkedCalendar)
    .setValue("true")
    .setSelected(false);
}

function DeleteLinkedCalendarWidget(calendar: GoogleAppsScript.Calendar.Calendar) {
  return CardService.newDecoratedText()
    .setTopLabel("Linked Google calendar")
    .setText(`Delete ${formatGoogleCalendarName(calendar)}?`)
    .setWrapText(true)
    .setSwitchControl(DeleteGoogleCalendarSwitch());
}

export const ConfirmDeleteCalendarCard = (teamCalendarId: TeamCalendarId) => {
  const buttons = CardService.newButtonSet()
    .addButton(ConfirmButton(teamCalendarId))
    .addButton(CancelButton());

  const teamCalendar = TeamCalendarController.read(teamCalendarId);
  if (!teamCalendar) throw new Error("Calendar not found. Maybe it was already deleted?");

  const linkedCalendar = teamCalendar
    ? LinkedCalendarController.read(teamCalendar.googleCalendarId)
    : undefined;

  let body = CardService.newCardSection().addWidget(
    CardService.newTextParagraph().setText(
      `Are you sure you want to delete this team calendar? This cannot be undone.`,
    ),
  );
  if (linkedCalendar) body = body.addWidget(DeleteLinkedCalendarWidget(linkedCalendar));
  body = body.addWidget(buttons);

  const card = CardService.newCardBuilder()
    .setHeader(CardService.newCardHeader().setTitle(`Delete "${teamCalendar.name}"`))
    .addSection(body);
  return card.build();
};
