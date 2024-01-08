import { queueFullSyncCalendars } from "./onFullSyncCalendars";
import { Endpoint } from "./utils/Endpoint";

export const onQueueFullSyncCalendars: Endpoint = () => {
  queueFullSyncCalendars({ seconds: 1 });
};

export const QueueFullSyncCalendarsAction = () => {
  return CardService.newAction().setFunctionName(onQueueFullSyncCalendars.name);
};
