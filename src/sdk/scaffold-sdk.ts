import * as fs from "fs-extra";
import path from "path";
import { HelperDelegate, Template } from "handlebars";
import { Project as TsProject } from "ts-morph";
import { RuntimeData } from "./types";
import { ParameterInitializer } from "./parameter-initializer";
import { paramEvaluator } from "../core/param-evaluator";
import { ParamType } from "../types";
import { runner } from "../core/runner";
import { getAllParentPaths } from "../util";
import { logger } from "../core/logger";

export class ScaffoldSdk<T extends RuntimeData> {
  private runtimeData: RuntimeData = {
    actions: {},
    conditions: {},
    partials: {},
    helpers: {},
    parameterList: {},
  };

  private tsProject?: TsProject;

  /** @private */
  public get internalRuntimeData() {
    return this.runtimeData;
  }

  public get template() {
    return runner.getTemplate();
  }

  public get targetPath() {
    return runner.getTargetPath();
  }

  public get handlebars() {
    return runner.handlebars;
  }

  public get hb() {
    return this.handlebars;
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

  readonly helper = new Proxy(
    {},
    {
      get:
        (_, helperKey: string) =>
        (...params) =>
          this.runtimeData.helpers[helperKey](...params),
    }
  ) as {
    [key in keyof T["helpers"]]: (...args: Parameters<T["helpers"][key]>) => ReturnType<T["helpers"][key]>;
  };

  readonly conditions = new Proxy(
    {},
    {
      get: (_, conditionKey: string) => async () => this.runtimeData.conditions[conditionKey](),
    }
  ) as { [key in keyof T["conditions"]]: (...args: Parameters<T["conditions"][key]>) => Promise<boolean> };

  readonly parameterLists = new Proxy(
    {},
    {
      get:
        (_, parameterSetKey: string) =>
        async (...params) =>
          this.runtimeData.parameterList[parameterSetKey](...params),
    }
  ) as {
    [key in keyof T["parameterList"]]: (
      ...args: Parameters<T["parameterList"][key]>
    ) => ReturnType<T["parameterList"][key]>;
  };

  readonly param = paramEvaluator.paramTypes.reduce<{
    [key in ParamType]: (name: string) => ParameterInitializer<key>;
  }>(
    (map, type) => ({
      ...map,
      [type]: (key: string) => new ParameterInitializer(key, type, this),
    }),
    {} as any
  );

  withAction<K extends string, A extends (...args: any[]) => any>(
    actionKey: K,
    action: A
  ): ScaffoldSdk<T & { actions: T["actions"] & { [k in K]: A } }> {
    this.runtimeData.actions[actionKey] = action;
    return this as any;
  }

  withCondition<K extends string, C extends (...args: any[]) => boolean | Promise<boolean>>(
    conditionKey: K,
    condition: C
  ): ScaffoldSdk<T & { conditions: T["conditions"] & { [k in K]: C } }> {
    this.runtimeData.conditions[conditionKey] = condition;
    return this as any;
  }

  withHelper<K extends string, H extends HelperDelegate>(
    name: K,
    helper: H
  ): ScaffoldSdk<T & { helpers: T["helpers"] & { [k in K]: H } }> {
    this.handlebars.registerHelper(name, helper);
    this.runtimeData.helpers[name] = helper;
    return this as any;
  }

  withParameterList<K extends string, S extends RuntimeData["parameterList"][string]>(
    name: K,
    parameterSet: S
  ): ScaffoldSdk<T & { parameterList: T["parameterList"] & { [k in K]: S } }> {
    this.runtimeData.parameterList[name] = parameterSet;
    return this as any;
  }

  withPartial<K extends string, P extends Template>(
    name: K,
    partial: P
  ): ScaffoldSdk<T & { partials: T["partials"] & { [k in K]: P } }> {
    this.handlebars.registerPartial(name, partial);
    this.runtimeData.partials[name] = partial;
    return this as any;
  }

  withActionSet<S extends RuntimeData["actions"]>(set: S): ScaffoldSdk<T & { actions: T["actions"] & S }> {
    Object.entries(set).forEach(([key, value]) => this.withAction(key, value));
    return this as any;
  }

  withConditionSet<S extends RuntimeData["conditions"]>(set: S): ScaffoldSdk<T & { conditions: T["conditions"] & S }> {
    Object.entries(set).forEach(([key, value]) => this.withCondition(key, value));
    return this as any;
  }

  withHelperSet<S extends RuntimeData["helpers"]>(set: S): ScaffoldSdk<T & { helpers: T["helpers"] & S }> {
    Object.entries(set).forEach(([key, value]) => this.withHelper(key, value));
    return this as any;
  }

  withPartialSet<S extends RuntimeData["partials"]>(set: S): ScaffoldSdk<T & { partials: T["partials"] & S }> {
    Object.entries(set).forEach(([key, value]) => this.withPartial(key, value));
    return this as any;
  }

  withParameterListSet<S extends RuntimeData["parameterList"]>(
    set: S
  ): ScaffoldSdk<T & { conditions: T["parameterList"] & S }> {
    Object.entries(set).forEach(([key, value]) => this.withParameterList(key, value));
    return this as any;
  }

  mergeWith<O extends RuntimeData>(
    otherSdk: ScaffoldSdk<O>
  ): ScaffoldSdk<{
    actions: T["actions"] & O["actions"];
    conditions: T["conditions"] & O["conditions"];
    helpers: T["helpers"] & O["helpers"];
    partials: T["partials"] & O["partials"];
    parameterList: T["parameterList"] & O["parameterList"];
  }> {
    Object.entries(otherSdk.internalRuntimeData.actions).forEach(([key, value]) => this.withAction(key, value));
    Object.entries(otherSdk.internalRuntimeData.conditions).forEach(([key, value]) => this.withCondition(key, value));
    Object.entries(otherSdk.internalRuntimeData.helpers).forEach(([key, value]) => this.withHelper(key, value));
    Object.entries(otherSdk.internalRuntimeData.partials).forEach(([key, value]) => this.withPartial(key, value));
    Object.entries(otherSdk.internalRuntimeData.parameterList).forEach(([key, value]) =>
      this.withParameterList(key, value)
    );
    return this as any;
  }

  setDataProperty<T>(dataPath: string, value: T) {
    const pieces = dataPath.split(".");
    const parent = pieces.slice(0, -1).reduce((data, key) => {
      if (!data[key]) {
        // eslint-disable-next-line no-param-reassign
        data[key] = {};
      }
      return data[key];
    }, runner.data);
    parent[pieces[pieces.length - 1]] = value;
  }

  getData() {
    return runner.data;
  }

  async getTemplateFileContents(relativePath: string) {
    return fs.readFile(path.join(this.template.source, relativePath), { encoding: "utf-8" });
  }

  fillTemplate(template: string) {
    return this.handlebars.compile(template)(this.getData());
  }

  async writeToTarget(relativePath: string, contents: string) {
    const fullPath = path.join(this.targetPath, relativePath);
    runner.addChangedFiles(fullPath);
    return fs.writeFile(fullPath, contents);
  }

  async getTsProject() {
    if (!this.tsProject) {
      const projectRoot = (
        await Promise.all(
          getAllParentPaths(this.targetPath).map(async folder => ({ folder, items: await fs.readdir(folder) }))
        )
      ).find(({ items }) => items.includes("tsconfig.json"))?.folder;
      if (!projectRoot) {
        throw new Error("Could not find a tsconfig.json in any parent folder");
      }
      logger.debug(`Found TypeScript Project root at ${projectRoot}`);
      this.tsProject = new TsProject({
        tsConfigFilePath: path.join(projectRoot, "tsconfig.json"),
        skipAddingFilesFromTsConfig: true,
      });
    }
    return this.tsProject;
  }

  async getTsSourceFile(filePath: string) {
    const project = await this.getTsProject();
    return project.getSourceFile(filePath) ?? project.addSourceFileAtPath(filePath);
    // return project.getSourceFile(filePath);
  }

  getChangedFiles() {
    return [...runner.getChangedFiles().values()];
  }

  registerChangedFiles(...targets: string[]) {
    runner.addChangedFiles(...targets.map(target => path.join(this.targetPath, target)));
  }
}
