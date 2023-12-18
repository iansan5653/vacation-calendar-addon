import { ConfirmDeleteCalendarAction } from "../endpoints/onConfirmDeleteCalendar";
import { GoBackAction } from "../endpoints/onGoBack";
import { TeamCalendarKey } from "../models/TeamCalendarKey";

function ConfirmButton(key: TeamCalendarKey) {
  const button = CardService.newTextButton()
    .setText("Delete")
    .setOnClickAction(ConfirmDeleteCalendarAction(key));
  return button;
}

function CancelButton() {
  const button = CardService.newTextButton().setText("Cancel").setOnClickAction(GoBackAction());
  return button;
}

export const ConfirmDeleteCalendarCard = (key: TeamCalendarKey) => {
  const buttons = CardService.newButtonSet()
    .addButton(ConfirmButton(key))
    .addButton(CancelButton());

  const card = CardService.newCardBuilder()
    .setHeader(CardService.newCardHeader().setTitle("Delete calendar"))
    .addSection(
      CardService.newCardSection()
        .addWidget(
          CardService.newTextParagraph().setText(
            `Are you sure you want to delete this calendar? This action cannot be undone.`,
          ),
        )
        .addWidget(buttons),
    );
  return card.build();
};
