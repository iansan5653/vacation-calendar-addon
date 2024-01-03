import { CalendarCard } from "../cards/Calendar";
import { TeamCalendarController } from "../controllers/TeamCalendarController";
import { TeamCalendarId } from "../models/TeamCalendarId";
import { Endpoint } from "./utils/Endpoint";
import { GridItemClickParameters } from "./utils/Parameters";

export const onClickCalendarGridItem: Endpoint = ({ commonEventObject }) => {
  Logger.log(commonEventObject);

  const identifier = new GridItemClickParameters(
    commonEventObject.parameters,
  ).getGridItemIdentifier();
  const teamCalendarId = identifier && TeamCalendarId.is(identifier) ? identifier : undefined;

  const calendar = teamCalendarId ? TeamCalendarController.read(teamCalendarId) : undefined;

  if (!teamCalendarId) throw new Error("Malformed request: invalid calendar grid item identifier.");
  if (!calendar) throw new Error("Error: Calendar not found. Maybe it was deleted?");

  const navigation = CardService.newNavigation().pushCard(CalendarCard(teamCalendarId, calendar));
  return CardService.newActionResponseBuilder().setNavigation(navigation).build();
};

export function OnClickCalendarGridItemAction() {
  return CardService.newAction().setFunctionName(onClickCalendarGridItem.name);
}
