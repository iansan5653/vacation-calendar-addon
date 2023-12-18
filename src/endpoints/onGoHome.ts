import { HomeCard } from "../cards/Home";
import { Endpoint } from "./utils/Endpoint";

export const onGoHome: Endpoint = () => {
  return CardService.newActionResponseBuilder().setNavigation(GoHomeNavigation()).build();
};

export function GoHomeNavigation() {
  return CardService.newNavigation().popToRoot().updateCard(HomeCard());
}

export function GoHomeAction() {
  return CardService.newAction().setFunctionName(onGoHome.name);
}
