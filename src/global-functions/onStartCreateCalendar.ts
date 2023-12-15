import { CreateCalendarFormCard } from "../cards/CreateCalendarForm";
import { GlobalFunction } from "./GlobalFunction";

export const onStartCreateCalendar: GlobalFunction = () => {
  const navigation = CardService.newNavigation().pushCard(CreateCalendarFormCard());

  return CardService.newActionResponseBuilder().setNavigation(navigation).build();
};
