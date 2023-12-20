import { add, Duration } from "date-fns";

export const QueueController = {
  queue(fn: string, after: Duration) {
    const date = add(new Date(), after);
    const trigger = ScriptApp.newTrigger(fn).timeBased().at(date).create();
    return trigger.getUniqueId();
  },
  clearQueue(fn: string) {
    ScriptApp.getProjectTriggers()
      .filter((trigger) => trigger.getHandlerFunction() === fn)
      .forEach((trigger) => ScriptApp.deleteTrigger(trigger));
  },
  /** Queue the function while clearing all other queued jobs for this function. */
  queueOnce(fn: string, after: Duration) {
    QueueController.clearQueue(fn);
    return QueueController.queue(fn, after);
  },
};
