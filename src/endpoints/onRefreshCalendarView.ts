import { CalendarCard } from "../cards/Calendar";
import { TeamCalendarId } from "../models/TeamCalendarId";
import { Endpoint } from "./utils/Endpoint";
import { TeamCalendarIdParameters } from "./utils/Parameters";

export const onRefreshCalendarView: Endpoint = ({ commonEventObject }) => {
  const calendarId = new TeamCalendarIdParameters(commonEventObject.parameters).getId();
  if (!calendarId) throw new Error("Calendar ID is required");

  return CardService.newActionResponseBuilder()
    .setNavigation(RefreshCalendarViewNavigation(calendarId))
    .build();
};

export function RefreshCalendarViewNavigation(teamCalendarId: TeamCalendarId) {
  return CardService.newNavigation().updateCard(CalendarCard(teamCalendarId));
}

export function RefreshCalendarViewAction(teamCalendarId: TeamCalendarId) {
  return CardService.newAction()
    .setFunctionName(onRefreshCalendarView.name)
    .setParameters(new TeamCalendarIdParameters().setId(teamCalendarId).build());
}
