import * as crypto from "crypto";
import * as fs from "fs-extra";
import os from "os";
import path from "path";
import { parse } from "yaml";

export const readYaml = async <T = any>(filePath: string): Promise<T> =>
  parse(await fs.readFile(filePath, { encoding: "utf-8" }));

export const isNotNullish = <T>(value: T | null | undefined): value is T => value !== undefined && value !== null;

export const promisePool = async (callback: (run: (...proms: Promise<any>[]) => void) => void) => {
  const promises: Promise<any>[] = [];
  callback((...proms) => {
    promises.push(...proms);
  });
  await Promise.all(promises);
};

export const hash = (str: string) => crypto.createHash("sha1").update(str).digest("hex");

const appData =
  process.env.APPDATA ||
  (process.platform === "darwin" ? `${process.env.HOME}/Library/Preferences` : `${process.env.HOME}/.local/share`);
export const fileNames = {
  templateRoot: "scaffold-templates.yml",
  tempDir: path.join(os.tmpdir(), "scaffold-cli"),
  localReposDir: path.join(appData, "scaffold-cli"),
};

export const getAllParentPaths = (folder: string) => {
  const pieces = path.normalize(folder).split(path.sep);
  return pieces.map((_, i) => pieces.slice(0, i + 1).join(path.sep)).reverse();
};
