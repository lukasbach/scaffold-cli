#!/usr/bin/env node
import { Command } from "commander";
import * as fs from "fs-extra";
import * as path from "path";

import * as handlebars from "handlebars";
import { listCommand } from "./commands/list";
import { newCommand } from "./commands/new";
import { logger } from "./core/logger";
import * as sdks from "./sdks";
import { fileNames } from "./util";

(async () => {
  const hb = handlebars.create();
  hb.registerHelper("camelCase", (await import("change-case")).camelCase);
  hb.registerPartial("part", '{{camelCase "jasdhfaskldjf asjdklfh sjakldf haksjldf"}}');
  const val = hb.compile("{{>part}}")({ abc: 123 });
  console.log("VALUE", val);

  global.sdks = sdks;
  global.execa = await import("execa");
  global.git = await import("simple-git");
  global.fs = await import("fs-extra");
  global.os = await import("os");
  global.yaml = await import("yaml");
  global.changeCase = await import("change-case");
  global.fetch = (await import("node-fetch")).default as any;
  global.$ = ((cmd, opts) => {
    logger.log(`Running ${cmd}`);
    return global.execa.execaCommand(cmd, opts);
  }) as any;

  const program = new Command();

  await fs.ensureDir(fileNames.tempDir);

  program.version(JSON.parse(fs.readFileSync(path.join(__dirname, "../package.json"), { encoding: "utf-8" })).version);
  program.addCommand(listCommand);
  program.addCommand(newCommand);

  program.parse(process.argv);
})();
