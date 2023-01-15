import * as fs from "fs-extra";
import path from "path";
import { RuntimeData } from "./types";
import { OptionInitializer } from "./option-initializer";
import { ArgumentConfig, initializeArgument } from "./initialize-argument";
import { paramEvaluator } from "../core/param-evaluator";
import { ParamType, ParamTypeMap } from "../types";
import { runner } from "../core/runner";

export class ScaffoldSdk<T extends RuntimeData> {
  private runtimeData: RuntimeData = { actions: {}, conditions: {}, data: {} };

  public get template() {
    return runner.getTemplate();
  }

  public get targetPath() {
    return runner.getTargetPath();
  }

  readonly actions = new Proxy(
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

  readonly conditions = new Proxy(
    {},
    {
      get: (_, conditionKey: string) => async () => this.runtimeData.conditions[conditionKey](),
    }
  ) as { [key in keyof T["conditions"]]: (...args: Parameters<T["conditions"][key]>) => Promise<boolean> };

  readonly argument = paramEvaluator.paramTypes.reduce<{
    [key in ParamType]: (name: string, config?: ArgumentConfig<key>) => Promise<ParamTypeMap[key]>;
  }>(
    (map, type) => ({
      ...map,
      [type]: (key: string, config?: ArgumentConfig<any>) => initializeArgument(key, type, this, config),
    }),
    {} as any
  );

  readonly option = paramEvaluator.paramTypes.reduce<{
    [key in ParamType]: (name: string) => OptionInitializer<key>;
  }>(
    (map, type) => ({
      ...map,
      [type]: (key: string) => new OptionInitializer(key, type, this),
    }),
    {} as any
  );

  withAction<K extends string, A extends (...args: any[]) => any>(actionKey: K, action: A) {
    this.runtimeData.actions[actionKey] = action;
    return this as ScaffoldSdk<T & { actions: T["actions"] & { [k in K]: A } }>;
  }

  withCondition<K extends string, C extends (...args: any[]) => boolean | Promise<boolean>>(
    conditionKey: K,
    condition: C
  ) {
    this.runtimeData.conditions[conditionKey] = condition;
    return this as ScaffoldSdk<T & { conditions: T["conditions"] & { [k in K]: C } }>;
  }

  setDataProperty<T>(dataPath: string, value: T) {
    const pieces = dataPath.split(".");
    const parent = pieces.slice(0, -1).reduce((data, key) => {
      if (!data[key]) {
        // eslint-disable-next-line no-param-reassign
        data[key] = {};
      }
      return data[key];
    }, this.runtimeData.data);
    parent[pieces[pieces.length - 1]] = value;
  }

  getData() {
    return this.runtimeData.data;
  }

  async getTemplateFileContents(relativePath: string) {
    return fs.readFile(path.join(this.template.source, relativePath), { encoding: "utf-8" });
  }

  async writeToTarget(relativePath: string, contents: string) {
    const fullPath = path.join(this.targetPath, relativePath);
    runner.addChangedFiles(fullPath);
    return fs.writeFile(fullPath, contents);
  }
}
