// The types don't accurately reflect that parameters will be undefined if not set
type Event = Omit<GoogleAppsScript.Addons.EventObject, "commonEventObject"> & {
  commonEventObject: Omit<GoogleAppsScript.Addons.CommonEventObject, "parameters"> & {
    parameters?: Partial<Record<string, string>>;
  };
};

interface Response {
  printJson(): string;
}

export type Endpoint = (event: Event) => Response | void;
