import { add, Duration } from "date-fns";

const KEY_PREFIX = "QUEUE_";

export const QueueController = {
  queue(fn: string, after: Duration, data: string = "") {
    const date = add(new Date(), after);
    const id = ScriptApp.newTrigger(fn).timeBased().at(date).create().getUniqueId();
    PropertiesService.getUserProperties().setProperty(`${KEY_PREFIX}${id}`, data);
    return id;
  },
  clearQueue(fn: string) {
    for (const trigger of ScriptApp.getProjectTriggers())
      if (trigger.getHandlerFunction() === fn) {
        ScriptApp.deleteTrigger(trigger);
        PropertiesService.getUserProperties().deleteProperty(
          `${KEY_PREFIX}${trigger.getUniqueId()}`,
        );
      }
  },
  /** Queue the function while clearing all other queued jobs for this function. */
  queueOnce(fn: string, after: Duration, data: string = "") {
    QueueController.clearQueue(fn);
    return QueueController.queue(fn, after, data);
  },
  /** Grab the data for this execution. */
  retrieveData(event: GoogleAppsScript.Events.TimeDriven) {
    try {
      return PropertiesService.getUserProperties().getProperty(`${KEY_PREFIX}${event.triggerUid}`);
    } catch {
      return null;
    }
  },
};
