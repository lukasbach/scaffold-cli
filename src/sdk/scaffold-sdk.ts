import { RuntimeData } from "./types";
import { OptionInitializer } from "./option-initializer";
import { templateScope } from "../core/template-scope";
import { ArgumentConfig, initializeArgument } from "./initialize-argument";
import { ParamType } from "../types";

export class ScaffoldSdk<T extends RuntimeData> {
  private runtimeData: RuntimeData = { actions: {}, conditions: {}, data: {} };

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

  public textArgument(name: string, config: ArgumentConfig<"string">) {
    return initializeArgument(name, "string", config);
  }

  public numberArgument(name: string, config: ArgumentConfig<"number">) {
    return initializeArgument(name, "number", config);
  }

  public text(key: string) {
    return new OptionInitializer(key, "string", this);
  }

  public number(key: string) {
    return new OptionInitializer(key, "number", this);
  }

  public boolean(key: string) {
    return new OptionInitializer(key, "boolean", this);
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

  public setDataProperty<T>(dataPath: string, value: T) {
    const pieces = dataPath.split(".");
    const parent = pieces.slice(0, -1).reduce((data, key) => {
      if (!data[key]) {
        // eslint-disable-next-line no-param-reassign
        data[key] = {};
      }
      return data[key];
    }, this.runtimeData.data);
    parent[pieces[pieces.length - 1]] = value;
    console.log(templateScope.getTemplates());
  }
}
