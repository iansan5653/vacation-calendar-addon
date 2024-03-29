import { TeamCalendarId } from "../../models/TeamCalendarId";

export type BooleanString = "true" | "false";

type BooleanKeys<T extends Record<string, string>> = {
  [K in keyof T]: T[K] extends BooleanString ? K : never;
}[keyof T];

export class Parameters<T extends Record<string, string>> {
  #data: Partial<T>;

  constructor(data?: Partial<T>) {
    this.#data = data ?? {};
  }

  build(): Record<string, string> {
    // ensure no {key: undefined} entries
    const result = {} as Record<string, string>;
    for (const [k, v] of Object.entries(this.#data)) if (v !== undefined) result[k] = v;
    return result;
  }

  set<K extends keyof T>(key: K, value: T[K] | undefined): this {
    this.#data[key] = value;
    return this;
  }

  get<K extends keyof T>(key: K): T[K] | undefined {
    return this.#data[key];
  }

  setBoolean<K extends BooleanKeys<T>>(key: K, value: boolean | undefined): this {
    return this.set(key, value?.toString() as T[K]);
  }

  getBoolean<K extends BooleanKeys<T>>(key: K): boolean | undefined {
    const value = this.get(key);
    return value === undefined ? undefined : value === "true";
  }
}

export type TeamCalendarIdParamsShape = {
  teamCalendarId: TeamCalendarId;
};

export class TeamCalendarIdParameters<T extends TeamCalendarIdParamsShape> extends Parameters<T> {
  setId(key: TeamCalendarId | undefined): this {
    return this.set("teamCalendarId", key);
  }

  getId(): TeamCalendarId | undefined {
    const value = this.get("teamCalendarId");
    return value && TeamCalendarId.is(value) ? value : undefined;
  }
}

/** Automatically provided to a handler for `Grid.setOnClickAction`. */
export class GridItemClickParameters<
  T extends { grid_item_identifier: string },
> extends Parameters<T> {
  /** Get the item identifier, set by `GridItem.setIdentifier`. */
  getGridItemIdentifier(): string | undefined {
    return this.get("grid_item_identifier");
  }
}
