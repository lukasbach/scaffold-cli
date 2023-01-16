import * as fs from "fs-extra";
import * as crypto from "crypto";
import { parse } from "yaml";
import path from "path";
import os from "os";

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

export const fileNames = {
  templateRoot: "scaffold-templates.yml",
  tempDir: path.join(os.tmpdir(), "scaffold-cli"),
};

export const getAllParentPaths = (folder: string) => {
  const pieces = path.normalize(folder).split(path.sep);
  return pieces.map((_, i) => pieces.slice(0, i + 1).join(path.sep)).reverse();
};
