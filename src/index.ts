#!/usr/bin/env node
import { Command } from "commander";
import * as fs from "fs";
import * as path from "path";
import { listCommand } from "./commands/list";

const program = new Command();

program.version(JSON.parse(fs.readFileSync(path.join(__dirname, "../package.json"), { encoding: "utf-8" })).version);
program.addCommand(listCommand);

program.parse(process.argv);
