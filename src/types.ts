import { DistinctChoice } from "inquirer";
import { RuntimeData, ScaffoldSdk } from "./sdk";

export type TemplateRepoYaml = {
  name?: string;
  author?: string;
};

export type TemplateRootYaml = {
  repositories: string[];
  templates: Record<string, string | TemplateUsageDeclaration>;
  isInternal?: boolean;
};

export type ParamConfig<T extends ParamType, O extends boolean = boolean> = {
  key: string;
  description?: string;
  type: T;
  optional?: O;
  default?: ParamTypeMap[T];
  choices?: DistinctChoice[];
  isArgument?: boolean;
  shortKey?: string;
};

export type ParamType = keyof ParamTypeMap;

export type ParamTypeMap = {
  string: string;
  boolean: boolean;
  number: number;
  list: string;
  checkbox: string[];
  password: string;
  editor: string;
  confirm: boolean;
  // expand: string;
};

export type TemplateUsageDeclaration = {
  source: string;
  defaults?: Record<string, ParamTypeMap[keyof ParamTypeMap]>;
};

export type TemplateRootData = TemplateRootYaml & { path: string };

export type RepoMetaData = {
  name?: string;
  key?: string;
  description?: string;
  author?: string;
  internal?: boolean;
};

export type MergedRuntimeData<T extends RuntimeData, O extends RuntimeData> = {
  actions: T["actions"] & O["actions"];
  conditions: T["conditions"] & O["conditions"];
  helpers: T["helpers"] & O["helpers"];
  partials: T["partials"] & O["partials"];
  parameterTemplates: T["parameterTemplates"] & O["parameterTemplates"];
};

export type RuntimeDataOf<T> = T extends ScaffoldSdk<infer X> ? X : never;
