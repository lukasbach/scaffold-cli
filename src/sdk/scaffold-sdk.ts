import * as fs from "fs-extra";
import path from "path";
import { HelperDelegate, Template } from "handlebars";
import { Project as TsProject } from "ts-morph";
import { RuntimeData } from "./types";
import { ParameterInitializer } from "./parameter-initializer";
import { MergedRuntimeData, ParamType } from "../types";
import { getAllParentPaths } from "../util";
import { scaffold } from "../scaffold";

export class ScaffoldSdk<
  T extends RuntimeData = { actions: {}; conditions: {}; data: {}; helpers: {}; partials: {}; parameterTemplates: {} }
> {
  private runtimeData: RuntimeData = {
    actions: {},
    conditions: {},
    partials: {},
    helpers: {},
    parameterTemplates: {},
  };

  private tsProject?: TsProject;

  /** @private */
  public get internalRuntimeData() {
    return this.runtimeData;
  }

  public get template() {
    return scaffold.runner.getTemplate();
  }

  public get targetPath() {
    return scaffold.runner.getTargetPath();
  }

  public get handlebars() {
    return scaffold.runner.handlebars;
  }

  public get hb() {
    return this.handlebars;
  }

  public get isIntrospectionRun() {
    return scaffold.introspection.isIntrospectionRun;
  }

  readonly actions = new Proxy(
    {},
    {
      get:
        (_, actionKey: string) =>
        async (...params) => {
          scaffold.introspection.registerActionCall(actionKey);

          if (scaffold.runner.getTemplate()?.omitActions?.includes(actionKey)) {
            scaffold.logger.debug(`Skipping action ${actionKey} because it is explicitly omitted.`);
            return null as any;
          }

          return this.runtimeData.actions[actionKey](...params);
        },
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

  readonly param = new Proxy(
    {},
    {
      get: (_, paramTypeOrParamTemplateKey: string) => {
        const isParamType = (p: string): p is ParamType => scaffold.paramEvaluator.paramTypes.includes(p as ParamType);

        if (isParamType(paramTypeOrParamTemplateKey)) {
          return (paramKey: string) => {
            const param = new ParameterInitializer(paramKey, paramTypeOrParamTemplateKey, this);
            scaffold.introspection.registerParameter(param);
            return param;
          };
        }
        return this.runtimeData.parameterTemplates[paramTypeOrParamTemplateKey];
      },
    }
  ) as {
    [key in keyof T["parameterTemplates"]]: T["parameterTemplates"][key];
  } & { [key in ParamType]: (paramKey: string) => ParameterInitializer<key> };

  setTemplateName(name: string) {
    scaffold.introspection.setTemplateName(name);
  }

  setTemplateDescription(descr: string) {
    scaffold.introspection.setTemplateDescription(descr);
  }

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

  withPartial<K extends string, P extends Template>(
    name: K,
    partial: P
  ): ScaffoldSdk<T & { partials: T["partials"] & { [k in K]: P } }> {
    this.handlebars.registerPartial(name, partial);
    this.runtimeData.partials[name] = partial;
    return this as any;
  }

  withParameterTemplate<K extends string, P extends () => ParameterInitializer<any>>(
    name: K,
    parameter: P
  ): ScaffoldSdk<T & { parameterTemplates: T["parameterTemplates"] & { [k in K]: P } }> {
    this.runtimeData.parameterTemplates[name] = parameter;
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

  withParameterTemplateSet<S extends RuntimeData["parameterTemplates"]>(
    set: S
  ): ScaffoldSdk<T & { parameterTemplates: T["parameterTemplates"] & S }> {
    Object.entries(set).forEach(([key, value]) => this.withParameterTemplate(key, value));
    return this as any;
  }

  mergeWith<O extends RuntimeData>(otherSdk: ScaffoldSdk<O>): ScaffoldSdk<MergedRuntimeData<T, O>> {
    Object.entries(otherSdk.internalRuntimeData.actions).forEach(([key, value]) => this.withAction(key, value));
    Object.entries(otherSdk.internalRuntimeData.conditions).forEach(([key, value]) => this.withCondition(key, value));
    Object.entries(otherSdk.internalRuntimeData.helpers).forEach(([key, value]) => this.withHelper(key, value));
    Object.entries(otherSdk.internalRuntimeData.partials).forEach(([key, value]) => this.withPartial(key, value));
    Object.entries(otherSdk.internalRuntimeData.parameterTemplates).forEach(([key, value]) =>
      this.withParameterTemplate(key, value)
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
    }, scaffold.runner.data);
    parent[pieces[pieces.length - 1]] = value;
  }

  getData() {
    return scaffold.runner.data;
  }

  async getTemplateFileContents(relativePath: string) {
    return fs.readFile(path.join(this.template.source, relativePath), { encoding: "utf-8" });
  }

  fillTemplate(template: string) {
    if (this.isIntrospectionRun) {
      try {
        this.handlebars.compile(template)(this.getData());
      } catch (_) {
        return template;
      }
    }
    try {
      return this.handlebars.compile(template)(this.getData());
    } catch (e) {
      console.error("Failed to fill handlebar template. See messages below for more details:");
      console.log("Occured error:", e);
      console.log("Data context available to template: ", this.getData());
      console.log("Template: ", template);
      throw new Error("Cannot fill handlebar template.");
    }
  }

  async writeToTarget(relativePath: string, contents: string) {
    if (this.isIntrospectionRun) {
      scaffold.introspection.registerOutput(relativePath, contents);
      return null;
    }
    const fullPath = path.join(this.targetPath, relativePath);
    scaffold.runner.addChangedFiles(fullPath);
    return fs.writeFile(fullPath, contents);
  }

  async appendWriteToTarget(relativePath: string, contents: string) {
    if (this.isIntrospectionRun) {
      scaffold.introspection.registerOutput(relativePath, contents);
      return null;
    }
    const fullPath = path.join(this.targetPath, relativePath);
    scaffold.runner.addChangedFiles(fullPath);
    const existingContent = fs.existsSync(fullPath) ? await fs.readFile(fullPath, { encoding: "utf-8" }) : "";
    return fs.writeFile(fullPath, existingContent + contents);
  }

  async getTsProject() {
    if (this.isIntrospectionRun) {
      throw new Error("Cannot get TS project in introspection mode");
    }

    if (!this.tsProject) {
      const projectRoot = (
        await Promise.all(
          getAllParentPaths(this.targetPath).map(async folder => ({ folder, items: await fs.readdir(folder) }))
        )
      ).find(({ items }) => items.includes("tsconfig.json"))?.folder;
      if (!projectRoot) {
        throw new Error("Could not find a tsconfig.json in any parent folder");
      }
      scaffold.logger.verbose(`Found TypeScript Project root at ${projectRoot}`);
      this.tsProject = new TsProject({
        tsConfigFilePath: path.join(projectRoot, "tsconfig.json"),
        skipAddingFilesFromTsConfig: true,
      });
    }
    return this.tsProject;
  }

  async do(callback: () => Promise<void>) {
    if (this.isIntrospectionRun) {
      return;
    }
    await callback();
  }

  async getTsSourceFile(filePath: string) {
    const project = await this.getTsProject();
    return project.getSourceFile(filePath) ?? project.addSourceFileAtPath(filePath);
    // return project.getSourceFile(filePath);
  }

  getChangedFiles() {
    return [...scaffold.runner.getChangedFiles().values()];
  }

  registerChangedFiles(...targets: string[]) {
    scaffold.runner.addChangedFiles(...targets.map(target => path.join(this.targetPath, target)));
  }
}
