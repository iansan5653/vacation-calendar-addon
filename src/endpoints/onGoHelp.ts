import { HelpCard } from "../cards/Help";
import { Endpoint } from "./utils/Endpoint";

export const onGoHelp: Endpoint = () => {
  return CardService.newActionResponseBuilder().setNavigation(GoHelpNavigation()).build();
};

export function GoHelpNavigation() {
  return CardService.newNavigation().pushCard(HelpCard());
}

export function GoHelpAction() {
  return CardService.newAction().setFunctionName(onGoHelp.name);
}
