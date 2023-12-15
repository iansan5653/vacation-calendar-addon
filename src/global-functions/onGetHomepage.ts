import { onClickCreateEvent } from "..";

export function onGetHomepage() {
  const helloWorld = CardService.newTextParagraph().setText("Hello Earth!");

  const createButton = CardService.newTextButton()
    .setText("Create")
    .setOnClickAction(CardService.newAction().setFunctionName(onClickCreateEvent.name));

  const section = CardService.newCardSection().addWidget(helloWorld).addWidget(createButton);

  const card = CardService.newCardBuilder()
    .setName("Home")
    .setHeader(CardService.newCardHeader().setTitle("Team Calendar"))
    .addSection(section)
    .build();

  return card;
}
