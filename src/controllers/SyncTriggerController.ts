import { onSyncTeamMember } from "../endpoints/onSyncTeamMember";

const SETTINGS_KEY = "syncTriggers";

type SyncTriggersSettings = Record<string, string>;

export const SyncTriggerController = {
  /** Create a trigger for the calendar, if one doesn't already exist. */
  create: (calendarId: string) => {
    const trigger =
      SyncTriggerController.read(calendarId) ??
      ScriptApp.newTrigger(onSyncTeamMember.name)
        .forUserCalendar(calendarId)
        .onEventUpdated()
        .create();

    PropertiesService.getUserProperties().setProperty(
      SETTINGS_KEY,
      JSON.stringify({
        ...SyncTriggerController.readAll(),
        [calendarId]: trigger.getUniqueId(),
      }),
    );
  },
  /** Get all known trigger IDs by calendar ID. */
  readAll: () =>
    JSON.parse(
      PropertiesService.getUserProperties().getProperty(SETTINGS_KEY) ?? "{}",
    ) as SyncTriggersSettings,
  /** Get trigger for calendar. */
  read: (calendarId: string) => {
    const triggerId = SyncTriggerController.readAll()[calendarId];
    return ScriptApp.getProjectTriggers().find((trigger) => trigger.getUniqueId() === triggerId);
  },
  /** Delete trigger for calendar. */
  delete: (calendarId: string) => {
    const trigger = SyncTriggerController.read(calendarId);
    if (trigger) ScriptApp.deleteTrigger(trigger);

    const existingTriggers = SyncTriggerController.readAll();
    if (calendarId in existingTriggers) {
      delete existingTriggers[calendarId];
      PropertiesService.getUserProperties().setProperty(
        SETTINGS_KEY,
        JSON.stringify(existingTriggers),
      );
    }
  },
};
