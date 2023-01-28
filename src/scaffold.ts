import { Logger, Runner, ParamEvaluator, TemplateScope } from "./core";
import * as sdks from "./sdks";
import { Introspection } from "./core/introspection";
import { ArgumentParser } from "./core/argument-parser";
import { SdkBuilder } from "./sdk/sdk-builder";

export const scaffold = {
  logger: new Logger(),
  runner: new Runner(),
  paramEvaluator: new ParamEvaluator(),
  templateScope: new TemplateScope(process.cwd()),
  introspection: new Introspection(),
  args: new ArgumentParser(),
  sdks,
  build: new SdkBuilder(),
};
