export function onClickCreateEvent(): GoogleAppsScript.Card_Service.ActionResponse {
  const yep = CardService.newTextParagraph().setText("Yep");

  const card = CardService.newCardBuilder()
    .setName("Home")
    .setHeader(CardService.newCardHeader().setTitle("Team Calendar"))
    .addSection(CardService.newCardSection().addWidget(yep))
    .build();

  const navigation = CardService.newNavigation().pushCard(card);

  const response = CardService.newActionResponseBuilder().setNavigation(navigation).build();

  return response;
}
