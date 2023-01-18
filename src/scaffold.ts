import { Logger } from "./core/logger";
import { Runner } from "./core/runner";
import { ParamEvaluator } from "./core/param-evaluator";
import { TemplateScope } from "./core/template-scope";
import * as sdks from "./sdks";

export const scaffold = {
  logger: new Logger(),
  runner: new Runner(),
  paramEvaluator: new ParamEvaluator(),
  templateScope: new TemplateScope(process.cwd()),
  sdks,
};
