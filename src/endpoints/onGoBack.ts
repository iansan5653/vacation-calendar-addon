import { Endpoint } from "./Endpoint";

export const onGoBack: Endpoint = () => {
  return CardService.newActionResponseBuilder()
    .setNavigation(CardService.newNavigation().popCard())
    .build();
};

export function GoBackAction() {
  return CardService.newAction().setFunctionName(onGoBack.name);
}
