interface GlobalFunctionResponse {
  printJson(): string;
}

export type GlobalFunction = (
  event: GoogleAppsScript.Addons.EventObject,
) => GlobalFunctionResponse | void;
