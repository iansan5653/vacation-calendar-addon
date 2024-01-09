type CalendarCommonEventObject = GoogleAppsScript.Addons.CommonEventObject;

// The types don't accurately reflect that parameters will be undefined if not set
type Event = Omit<GoogleAppsScript.Addons.EventObject, "commonEventObject"> & {
  commonEventObject: Omit<CalendarCommonEventObject, "parameters" | "formInputs"> & {
    parameters?: CalendarCommonEventObject["parameters"];
    formInputs?: CalendarCommonEventObject["formInputs"];
  };
};

interface Response {
  printJson(): string;
}

export type Endpoint = (event: Event) => Response | Response[] | void;

export type CalendarSyncEndpoint = (event: GoogleAppsScript.Events.CalendarEventUpdated) => void;
