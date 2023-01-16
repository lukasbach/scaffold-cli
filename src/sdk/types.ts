import { HelperDelegate, Template } from "handlebars";

export type RuntimeData = {
  actions: Record<string, (...args: any[]) => any>;
  conditions: Record<string, (...args: any[]) => boolean | Promise<boolean>>;
  helpers: Record<string, HelperDelegate>;
  partials: Record<string, Template>;

  data: Record<string, any>;
};
