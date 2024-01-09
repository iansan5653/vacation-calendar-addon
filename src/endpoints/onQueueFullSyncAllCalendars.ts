import { asyncFullSyncAllCalendars } from "../jobs/asyncFullSyncAllCalendars";
import { Endpoint } from "./utils/Endpoint";

export const onQueueFullSyncAllCalendars: Endpoint = () => {
  asyncFullSyncAllCalendars();
};

export const QueueFullSyncAllCalendarsAction = () => {
  return CardService.newAction().setFunctionName(onQueueFullSyncAllCalendars.name);
};
