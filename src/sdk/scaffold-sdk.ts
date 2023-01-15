import { RuntimeData } from "./types";
import { OptionInitializer } from "./option-initializer";
import { templateScope } from "../core/template-scope";
import { ArgumentConfig, initializeArgument } from "./initialize-argument";
import { paramEvaluator } from "../core/param-evaluator";
import { ParamType, ParamTypeMap } from "../types";

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

  public readonly argument = paramEvaluator.paramTypes.reduce<{
    [key in ParamType]: (name: string, config?: ArgumentConfig<key>) => Promise<ParamTypeMap[key]>;
  }>(
    (map, type) => ({
      ...map,
      [type]: (key: string, config?: ArgumentConfig<any>) => initializeArgument(key, type, config),
    }),
    {} as any
  );

  public readonly option = paramEvaluator.paramTypes.reduce<{
    [key in ParamType]: (name: string) => OptionInitializer<key>;
  }>(
    (map, type) => ({
      ...map,
      [type]: (key: string) => new OptionInitializer(key, type, this),
    }),
    {} as any
  );

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
