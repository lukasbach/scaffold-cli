#!/usr/bin/env node
import * as fs from "fs-extra";
import * as path from "path";

import { fileNames } from "./util";
import { scaffold } from "./scaffold";

(async () => {
  global.scaffold = scaffold;
  global.execa = await import("execa");
  global.git = await import("simple-git");
  global.fs = await import("fs-extra");
  global.os = await import("os");
  global.yaml = await import("yaml");
  global.changeCase = await import("change-case");
  global.fetch = (await import("node-fetch")).default as any;
  global.$ = ((cmd, opts) => {
    scaffold.logger.log(`Running ${cmd}`);
    return global.execa.execaCommand(cmd, opts);
  }) as any;

  await fs.ensureDir(fileNames.tempDir);

  if (scaffold.args.getOption("version", "v")) {
    const { version } = JSON.parse(fs.readFileSync(path.join(__dirname, "../package.json"), { encoding: "utf-8" }));
    console.log(`scaffold-cli ${version}`);
    process.exit(0);
  }

  await scaffold.templateScope.initialize();

  const template = scaffold.templateScope.getTemplates()[scaffold.args.getTemplateName()];
  if (!template) {
    throw new Error(`No template registered with the name ${template}`);
  }

  const documentTemplate = scaffold.args.getOption("document-template");
  if (documentTemplate) {
    await scaffold.runner.introspectTemplate(template);
    await scaffold.introspection.documentTemplate(documentTemplate);
    process.exit(0);
  }

  await scaffold.runner.runTemplate(template, process.cwd());
})();
