#!/usr/bin/env node
import * as fs from "fs-extra";
import * as path from "path";

import { fileNames } from "./util";
import { scaffold } from "./scaffold";
import { ParamEvaluator } from "./core";

(async () => {
  global.scaffold = scaffold;
  global.execa = await import("execa");
  global.git = await import("simple-git");
  global.fs = fs;
  global.path = path;
  global.os = await import("os");
  global.yaml = await import("yaml");
  global.changeCase = await import("change-case");
  global.fetch = (await import("node-fetch")).default as any;
  global.$ = ((cmd, opts) => {
    if (scaffold.introspection.isIntrospectionRun) {
      return null;
    }
    scaffold.logger.log(`Running ${cmd}`);
    return global.execa.execaCommand(cmd, opts);
  }) as any;

  await fs.ensureDir(fileNames.tempDir);

  if (scaffold.args.getOption("version", "v")) {
    const { version } = JSON.parse(fs.readFileSync(path.join(__dirname, "../package.json"), { encoding: "utf-8" }));
    console.log(`scaffold-cli ${version}`);
    process.exit(0);
  }

  await scaffold.templateScope.ensureUserTemplateRoot();
  await scaffold.templateScope.initialize();

  const templateName = scaffold.args.getTemplateName();
  const template = scaffold.templateScope.getTemplates()[templateName];
  if (!template) {
    throw new Error(`No template registered with the name ${templateName}`);
  }

  scaffold.logger.debug(`Resolved template: ${template.sourceKey}`);
  scaffold.logger.debug(`Template source: ${template.source}`);
  scaffold.logger.debug(`Repository at: ${template.repoPath}`);

  const documentTemplate = scaffold.args.getOption("document-template");
  if (documentTemplate) {
    await scaffold.runner.introspectTemplate(template);
    await scaffold.introspection.documentTemplate(documentTemplate);
    process.exit(0);
  }

  if (scaffold.args.getOption("help", "h")) {
    await scaffold.runner.introspectTemplate(template);
    const manpage = scaffold.introspection.getManpage();
    console.log(manpage);
    process.exit(0);
  }

  await scaffold.runner.runTemplate(template, process.cwd());

  if (ParamEvaluator.defaultEvaluations > 0) {
    scaffold.logger.log(
      `${ParamEvaluator.defaultEvaluations} parameters where not specified and fell back to default values. ` +
        `Run "scaf ${templateName} --help" for details on all parameters.`
    );
  }
})();

// TODO Error: Template C:\Users\lbach\lukasbach\scaffold-cli\templates\react\react-fc not found
// TODO after yarn start customize react-fc --global
