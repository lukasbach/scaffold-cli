/* eslint-disable no-var,vars-on-top */
import type execaLib from "execa";
import type * as gitLib from "simple-git";
import type * as fsLib from "fs-extra";
import type * as pathLib from "path";
import type * as osLib from "os";
import type * as yamlLib from "yaml";
import type * as changeCaseLib from "change-case";
import type { scaffold as scaffoldLib } from "./scaffold";
import { ScaffoldSdk } from "./sdk";

declare global {
  var scaffold: typeof scaffoldLib;
  var $: typeof execaLib;
  var execa: typeof execaLib;
  var git: typeof gitLib;
  var fs: typeof fsLib;
  var path: typeof pathLib;
  var os: typeof osLib;
  var yaml: typeof yamlLib;
  var changeCase: typeof changeCaseLib;
  var lastSdk: ScaffoldSdk;
}
