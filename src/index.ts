#!/usr/bin/env node
import { Command } from "commander";
import * as fs from "fs-extra";
import * as path from "path";
import { listCommand } from "./commands/list";
import { newCommand } from "./commands/new";
import { fileNames } from "./util";

(async () => {
  const program = new Command();

  await fs.ensureDir(fileNames.tempDir);

  program.version(JSON.parse(fs.readFileSync(path.join(__dirname, "../package.json"), { encoding: "utf-8" })).version);
  program.addCommand(listCommand);
  program.addCommand(newCommand);

  program.parse(process.argv);
  const myList = ["a", 1];
})();

const global = ["a", 1];
