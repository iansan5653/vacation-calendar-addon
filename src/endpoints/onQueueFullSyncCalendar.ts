import { asyncFullSyncCalendar } from "../jobs/asyncFullSyncCalendar";
import { TeamCalendarId } from "../models/TeamCalendarId";
import { RefreshCalendarViewNavigation } from "./onRefreshCalendarView";
import { Endpoint } from "./utils/Endpoint";
import { TeamCalendarIdParameters } from "./utils/Parameters";

export const onQueueFullSyncCalendar: Endpoint = (event) => {
  const calendarId = new TeamCalendarIdParameters(event.commonEventObject.parameters).getId();
  if (!calendarId) throw new Error("Missing parameter: Cannot queue full sync without calendar ID");

  asyncFullSyncCalendar(calendarId);

  // Refresh the view to update status
  return CardService.newActionResponseBuilder()
    .setNavigation(RefreshCalendarViewNavigation(calendarId))
    .build();
};

export const QueueFullSyncCalendarAction = (calendarId: TeamCalendarId) => {
  return CardService.newAction()
    .setFunctionName(onQueueFullSyncCalendar.name)
    .setParameters(new TeamCalendarIdParameters().setId(calendarId).build());
};
