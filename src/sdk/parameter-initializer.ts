import { DistinctChoice } from "inquirer";
import { ParamType, ParamTypeMap } from "../types";
import type { ScaffoldSdk } from "./scaffold-sdk";
import { scaffold } from "../scaffold";

let evaluatedArgumentsCount = 0;

export class ParameterInitializer<T extends ParamType> implements Promise<ParamTypeMap[T]> {
  private shortKey?: string;

  private description?: string;

  private isRequired = true;

  private defaultValue?: ParamTypeMap[T];

  private onRejected?: Parameters<typeof this.catch>[0];

  private prom?: Promise<ParamTypeMap[T]>;

  private argumentIndex?: number;

  private isArgument?: boolean;

  private possibleChoices?: DistinctChoice[];

  constructor(private key: string, private type: T, private sdk: ScaffoldSdk<any>) {}

  asArgument(argumentIndex?: number) {
    this.isArgument = true;
    this.argumentIndex = argumentIndex;
    return this;
  }

  short(shortKey: string) {
    this.shortKey = shortKey;
    return this;
  }

  descr(description: string) {
    this.description = description;
    return this;
  }

  optional() {
    this.isRequired = false;
    return this;
  }

  default(defaultValue: ParamTypeMap[T]) {
    this.defaultValue = defaultValue;
    return this;
  }

  choices(choices: DistinctChoice[]) {
    this.possibleChoices = choices;
    return this;
  }

  private async evaluate(): Promise<ParamTypeMap[T] | undefined> {
    const value = await scaffold.paramEvaluator.evaluate(
      {
        type: this.type,
        key: this.key,
        description: this.description,
        optional: !this.isRequired,
        default: this.defaultValue,
        hint: `Append --${this.key}=value to auto-fill this`,
        choices: this.possibleChoices,
      },
      this.getProvidedValue()
    );
    this.sdk.setDataProperty(this.key, value);
    return value;
  }

  private getProvidedValue() {
    if (this.isArgument) {
      const value = scaffold.runner.getArguments()[this.argumentIndex ?? evaluatedArgumentsCount];
      evaluatedArgumentsCount++;
      return value;
    }
    return scaffold.runner.getOption(this.key, this.shortKey);
  }

  then<TResult1 = ParamTypeMap[T], TResult2 = never>(
    onfulfilled?: ((value: ParamTypeMap[T]) => PromiseLike<TResult1> | TResult1) | undefined | null,
    onrejected?: ((reason: any) => PromiseLike<TResult2> | TResult2) | undefined | null
  ): Promise<TResult1 | TResult2> {
    const prom = this.evaluate().then(onfulfilled, onrejected);
    if (this.onRejected) {
      this.catch(this.onRejected);
    }
    return prom;
  }

  catch<TResult = never>(
    onrejected?: ((reason: any) => PromiseLike<TResult> | TResult) | undefined | null
  ): Promise<ParamTypeMap[T] | TResult> {
    this.onRejected = onrejected;
    if (!this.prom) {
      throw new Error(`.catch() called prior to .then()`);
    }
    return this.prom;
  }

  // eslint-disable-next-line class-methods-use-this,@typescript-eslint/no-unused-vars
  finally(onfinally?: (() => void) | null | undefined): Promise<ParamTypeMap[T]> {
    throw new Error("Method not implemented.");
  }

  [Symbol.toStringTag] = "[PropertyInitializer]";
}
