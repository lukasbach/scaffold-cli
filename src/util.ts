import * as fs from "fs-extra";
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
