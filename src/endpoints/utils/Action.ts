import { Parameters } from "./Parameters";

export class Action<P extends Record<string, string>> {
  constructor(
    readonly functionName: string,
    readonly parameters: Parameters<P> = new Parameters<P>(),
  ) {}

  queue() {
    return;
  }

  build() {
    return CardService.newAction()
      .setFunctionName(this.functionName)
      .setParameters(this.parameters.build());
  }
}
