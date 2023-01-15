import { ParamConfig, ParamType, ParamTypeMap } from "../types";
import { paramEvaluator } from "../core/param-evaluator";
import { runner } from "../core/runner";
import { ScaffoldSdk } from "./scaffold-sdk";

let argumentCount = 0;

export type ArgumentConfig<T extends ParamType> = Omit<ParamConfig<T>, "name" | "type"> & { index?: number };
export const initializeArgument = async (
  key: string,
  type: keyof ParamTypeMap,
  sdk: ScaffoldSdk<any>,
  options?: { description?: string; optional?: boolean; index?: number }
) => {
  const value = await paramEvaluator.evaluate(
    {
      key,
      type,
      ...options,
    },
    runner.getArguments()[options?.index ?? argumentCount++]
  );
  sdk.setDataProperty(key, value);
  return value;
};
