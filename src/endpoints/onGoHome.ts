import { Endpoint } from "./Endpoint";

export const onGoHome: Endpoint = () => {
  return CardService.newActionResponseBuilder()
    .setNavigation(CardService.newNavigation().popToRoot())
    .build();
};

export function GoHomeAction() {
  return CardService.newAction().setFunctionName(onGoHome.name);
}
