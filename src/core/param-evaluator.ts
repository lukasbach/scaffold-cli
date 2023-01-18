/* eslint-disable class-methods-use-this */
import inquirer from "inquirer";
import { ParamConfig, ParamType, ParamTypeMap } from "../types";

const isParamType = <T extends ParamType>(type: T, param: ParamConfig<any, any>): param is ParamConfig<T, any> =>
  type === param.type;

export class ParamEvaluator {
  public readonly paramTypes: ParamType[] = [
    "string",
    "number",
    "boolean",
    "list",
    "confirm",
    "checkbox",
    "password",
    "editor",
    // "expand",
  ];

  async evaluate<T extends keyof ParamTypeMap, O extends boolean = false>(
    param: ParamConfig<T, O>,
    cliValue?: string | true
  ): Promise<ParamTypeMap[T] | undefined> {
    // : Promise<ParamTypeMap[T] | (O extends true ? undefined : never)>
    const value = await (async () => {
      if (isParamType("string", param)) {
        return (await this.evaluateString(param, cliValue)) as any;
      }

      if (isParamType("number", param)) {
        return (await this.evaluateNumber(param, cliValue)) as any;
      }

      if (isParamType("boolean", param)) {
        return (await this.evaluateBoolean(param, cliValue)) as any;
      }

      if (isParamType("confirm", param)) {
        return (await this.evaluateConfirm(param, cliValue)) as any;
      }

      if (isParamType("list", param)) {
        return (await this.evaluateList(param, cliValue)) as any;
      }

      if (isParamType("checkbox", param)) {
        return (await this.evaluateMultiList(param, cliValue, "checkbox")) as any;
      }

      if (isParamType("password", param)) {
        return (await this.evaluateString(param, cliValue, "password")) as any;
      }

      if (isParamType("editor", param)) {
        return (await this.evaluateString(param, cliValue, "editor")) as any;
      }

      if (isParamType("expand", param)) {
        return (await this.evaluateList(param, cliValue, "expand")) as any;
      }

      throw new Error(`Unknown parameter type ${param.type}`);
    })();
    return value ?? param.default;
  }

  private async evaluateString<O extends boolean>(
    param: ParamConfig<"string" | "password" | "editor", O>,
    cliValue?: string | true,
    type = "input"
  ) {
    if (cliValue) {
      return `${cliValue}`;
    }
    if (!param.optional) {
      return (
        await inquirer.prompt({
          type: type as any,
          name: param.key,
          message: param.description,
          default: param.default,
        })
      )[param.key] as string;
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
          name: param.key,
          message: param.description,
          default: param.default,
        })
      )[param.key];
    }

    return undefined;
  }

  private async evaluateConfirm<O extends boolean>(param: ParamConfig<"confirm", O>, cliValue?: string | true) {
    if (cliValue) {
      return cliValue === true || cliValue.toLowerCase() === "true";
    }
    if (!param.optional) {
      return (
        await inquirer.prompt({
          type: "confirm",
          name: param.key,
          message: param.description,
          default: param.default,
        })
      )[param.key];
    }

    return undefined;
  }

  private async evaluateBoolean<O extends boolean>(param: ParamConfig<"boolean", O>, cliValue?: string | true) {
    if (cliValue) {
      return cliValue === true || cliValue.toLowerCase() === "true";
    }
    if (!param.optional) {
      return (
        (
          await inquirer.prompt({
            type: "list",
            name: param.key,
            message: param.description,
            default: param.default,
            choices: [
              { key: "true", value: "Yes" },
              { key: "false", value: "No" },
            ],
          })
        )[param.key] === "true"
      );
    }

    return undefined;
  }

  private async evaluateList<O extends boolean>(
    param: ParamConfig<"list" | "expand", O>,
    cliValue?: string | true,
    type = "list"
  ) {
    if (cliValue) {
      return `${cliValue}`;
    }
    if (!param.optional) {
      return (
        await inquirer.prompt({
          type: type as any,
          name: param.key,
          message: param.description,
          default: param.default,
          choices: param.choices,
        })
      )[param.key] as string;
    }

    return undefined;
  }

  private async evaluateMultiList<O extends boolean>(
    param: ParamConfig<"checkbox", O>,
    cliValue?: string | true,
    type = "checkbox"
  ) {
    if (cliValue) {
      return `${cliValue}`;
    }
    if (!param.optional) {
      return (
        await inquirer.prompt({
          type: type as any,
          name: param.key,
          message: param.description,
          default: param.default,
          choices: param.choices,
        })
      )[param.key] as string[];
    }

    return undefined;
  }
}
