export function getHomepage() {
  const helloWorld = CardService.newTextParagraph().setText("Hello World!");

  const section = CardService.newCardSection().addWidget(helloWorld);

  const card = CardService.newCardBuilder()
    .setName("Home")
    .setHeader(CardService.newCardHeader().setTitle("Team Calendar"))
    .addSection(section)
    .build();
  
  return card;
}