import { RuntimeData } from "./types";
import { PropertyInitializer } from "./PropertyInitializer";

export class ScaffoldSdk<T extends RuntimeData> {
  private runtimeData: RuntimeData = { actions: {}, conditions: {} };

  public readonly actions = new Proxy(
    {},
    {
      get:
        (_, actionKey: string) =>
        async (...params) =>
          this.runtimeData.actions[actionKey](...params),
    }
  ) as {
    [key in keyof T["actions"]]: (...args: Parameters<T["actions"][key]>) => Promise<ReturnType<T["actions"][key]>>;
  };

  public readonly conditions = new Proxy(
    {},
    {
      get: (_, conditionKey: string) => async () => this.runtimeData.conditions[conditionKey](),
    }
  ) as { [key in keyof T["conditions"]]: (...args: Parameters<T["conditions"][key]>) => Promise<boolean> };

  public text(key: string) {
    return new PropertyInitializer(key, "string", this);
  }

  public number(key: string) {
    return new PropertyInitializer(key, "number", this);
  }

  public boolean(key: string) {
    return new PropertyInitializer(key, "boolean", this);
  }

  public withAction<K extends string, A extends (...args: any[]) => any>(actionKey: K, action: A) {
    this.runtimeData.actions[actionKey] = action;
    return this as ScaffoldSdk<T & { actions: T["actions"] & { [k in K]: A } }>;
  }

  public withCondition<K extends string, C extends (...args: any[]) => boolean | Promise<boolean>>(
    conditionKey: K,
    condition: C
  ) {
    this.runtimeData.conditions[conditionKey] = condition;
    return this as ScaffoldSdk<T & { conditions: T["conditions"] & { [k in K]: C } }>;
  }
}
