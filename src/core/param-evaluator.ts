/* eslint-disable class-methods-use-this */
import inquirer from "inquirer";
import { ParamConfig, ParamType, ParamTypeMap } from "../types";

const isParamType = <T extends ParamType>(type: T, param: ParamConfig<any, any>): param is ParamConfig<T, any> =>
  type === param.type;

export class ParamEvaluator {
  evaluate<T extends keyof ParamTypeMap, O extends boolean = false>(
    param: ParamConfig<T, O>,
    cliValue?: string | true
  ): Promise<ParamTypeMap[T] | undefined> {
    // : Promise<ParamTypeMap[T] | (O extends true ? undefined : never)>
    if (isParamType("string", param)) {
      return this.evaluateString(param, cliValue) as any;
    }

    if (isParamType("number", param)) {
      return this.evaluateNumber(param, cliValue) as any;
    }

    if (isParamType("boolean", param)) {
      return this.evaluateBoolean(param, cliValue) as any;
    }

    throw new Error(`Unknown parameter type ${param.type}`);
  }

  private async evaluateString<O extends boolean>(param: ParamConfig<"string", O>, cliValue?: string | true) {
    if (cliValue) {
      return `${cliValue}`;
    }
    if (!param.optional) {
      return (
        await inquirer.prompt({
          type: "input",
          name: param.name,
          message: param.description,
          default: param.default,
        })
      )[param.name] as string;
    }

    return undefined;
  }

  private async evaluateNumber<O extends boolean>(param: ParamConfig<"number", O>, cliValue?: string | true) {
    if (cliValue) {
      return parseFloat(`${cliValue}`);
    }
    if (!param.optional) {
      return (
        await inquirer.prompt({
          type: "number",
          name: param.name,
          message: param.description,
          default: param.default,
        })
      )[param.name];
    }

    return undefined;
  }

  private async evaluateBoolean<O extends boolean>(param: ParamConfig<"boolean", O>, cliValue?: string | true) {
    if (cliValue) {
      return cliValue === true || cliValue.toLowerCase() === "true";
    }
    if (!param.optional) {
      return (
        await inquirer.prompt({
          type: "confirm",
          name: param.name,
          message: param.description,
          default: param.default,
        })
      )[param.name];
    }

    return undefined;
  }
}

export const paramEvaluator = new ParamEvaluator();
