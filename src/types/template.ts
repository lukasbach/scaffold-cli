export type TemplateRepoYaml = {
  name?: string;
  author?: string;
};

export type TemplateConfigYaml = {
  name: string;
  inputs: Record<string, ParamConfig<any>>;
};

export type TemplateRootYaml = {
  repositories: string[];
  templates: Record<string, string | TemplateUsageDeclaration>;
};

export type ParamConfig<T extends ParamType> = {
  description?: string;
  type: T;
  required?: boolean;
  default?: ParamTypeMap[T];
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
