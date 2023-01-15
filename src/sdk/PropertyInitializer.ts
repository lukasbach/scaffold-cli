import { ParamType, ParamTypeMap } from "../types";
import type { ScaffoldSdk } from "./scaffold-sdk";

export class PropertyInitializer<T extends ParamType> implements Promise<ParamTypeMap[T]> {
  private description: string;

  private isRequired = true;

  private defaultValue?: ParamTypeMap[T];

  private onRejected?: Parameters<typeof this.catch>[0];

  private prom?: Promise<ParamTypeMap[T]>;

  constructor(private key: string, private type: T, private runtime: ScaffoldSdk<any>) {}

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
    return this.optional();
  }

  private async evaluate(): Promise<ParamTypeMap[T]> {
    console.log(`Evaluate ${this.key}`, this.description, this.isRequired);
    return null as any;
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
