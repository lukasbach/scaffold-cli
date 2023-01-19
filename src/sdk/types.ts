import { HelperDelegate, Template } from "handlebars";
import { ParameterInitializer } from "./parameter-initializer";

export type RuntimeData = {
  actions: Record<string, (...args: any[]) => any>;
  conditions: Record<string, (...args: any[]) => boolean | Promise<boolean>>;
  helpers: Record<string, HelperDelegate>;
  partials: Record<string, Template>;
  parameterTemplates: Record<string, () => ParameterInitializer<any>>;
};
