/* eslint-disable no-var,vars-on-top */
import type execaLib from "execa";
import type * as gitLib from "simple-git";
import type * as fsLib from "fs-extra";
import type * as osLib from "os";
import type * as yamlLib from "yaml";
import type * as changeCaseLib from "change-case";
import type { createSdk as createSdkFunc } from "./sdk/create-sdk";

declare global {
  var properties: Record<string, any>;
  var createSdk: typeof createSdkFunc;
  var $: typeof execaLib.execaCommand;
  var execa: typeof execaLib;
  var git: typeof gitLib;
  var fs: typeof fsLib;
  var os: typeof osLib;
  var yaml: typeof yamlLib;
  var changeCase: typeof changeCaseLib;
}
