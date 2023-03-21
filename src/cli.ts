#!/usr/bin/env node
import * as fs from "fs-extra";
import * as path from "path";

import noindent from "noindent";
import { fileNames } from "./util";
import { scaffold } from "./scaffold";
import { ParamEvaluator } from "./core";

const hello = noindent(`
  scaffold cli
  
  Run "scaf list" to list available templates and commands.
  `);

(async () => {
  global.scaffold = scaffold;
  global.execa = (await import("execa")).default;
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
    scaffold.logger.verbose(`Running $ ${cmd}`);
    return global.execa(cmd, opts);
  }) as any;

  await fs.ensureDir(fileNames.tempDir);

  if (scaffold.args.getOption("version", "v")) {
    const { version } = JSON.parse(fs.readFileSync(path.join(__dirname, "../package.json"), { encoding: "utf-8" }));
    console.log(`scaffold ${version}`);
    process.exit(0);
  }

  await scaffold.templateScope.ensureUserTemplateRoot();
  await scaffold.templateScope.initialize();

  const templateName = scaffold.args.getTemplateName();

  if (!templateName) {
    console.log(hello);
    process.exit(0);
  }

  const template = scaffold.templateScope.getTemplates()[templateName];
  if (!template) {
    throw new Error(`No template registered with the name ${templateName}`);
  }

  scaffold.logger.verbose(`Resolved template: ${template.sourceKey}`);
  scaffold.logger.verbose(`Template source: ${template.source}`);
  scaffold.logger.verbose(`Repository at: ${template.repoPath}`);

  const documentTemplate = scaffold.args.getOption("documentTemplate");
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

  try {
    await scaffold.runner.runTemplate(template, process.cwd());
  } catch (e) {
    if (template.omitActions?.length) {
      console.log(
        "ERROR: Something went wrong when evaluating the the template. Note that the used template explicitly " +
          "disabled actions, which might have been required for the evaluation of the template. Try not omitting them " +
          "to see if this resolves the issue."
      );
    } else {
      console.log(
        "ERROR: Something went wrong when evaluating the the template. Try running with `--logLevel debug` " +
          "if you suspect this could be related to scaffold."
      );
    }
    throw e;
  }

  if (ParamEvaluator.defaultEvaluations > 0) {
    scaffold.logger.log(
      `${ParamEvaluator.defaultEvaluations} parameters were not specified and fell back to default values. ` +
        `Run "scaf ${templateName} -h" for details on all parameters.`
    );
  }
})();

// TODO Error: Template C:\Users\lbach\lukasbach\scaffold-cli\templates\react\react-fc not found
// TODO after yarn start customize react-fc --global
