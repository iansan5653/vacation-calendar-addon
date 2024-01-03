import { TeamCalendarKey } from "../../models/TeamCalendarKey";

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
}

export class CalendarKeyParameters<
  T extends { calendarKey: TeamCalendarKey },
> extends Parameters<T> {
  setCalendarKey(key: TeamCalendarKey | undefined): this {
    return this.set("calendarKey", key);
  }

  getCalendarKey(): TeamCalendarKey | undefined {
    const key = this.get("calendarKey");
    return key && TeamCalendarKey.is(key) ? key : undefined;
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
