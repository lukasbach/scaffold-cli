export type TemplateRepoYaml = {
  name?: string;
  author?: string;
};

export type TemplateRootYaml = {
  repositories: string[];
  templates: Record<string, string | TemplateUsageDeclaration>;
};

export type ParamConfig<T extends ParamType, O extends boolean = boolean> = {
  key: string;
  description?: string;
  type: T;
  optional?: O;
  default?: ParamTypeMap[T];
  hint?: string;
};

export type ParamType = keyof ParamTypeMap;

export type ParamTypeMap = {
  string: string;
  boolean: boolean;
  number: number;
};

export type TemplateUsageDeclaration = {
  source: string;
  defaults?: Record<string, ParamTypeMap[keyof ParamTypeMap]>;
};

export type TemplateRootData = TemplateRootYaml & { path: string };
