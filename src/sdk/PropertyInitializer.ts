import { ParamType, ParamTypeMap } from "../types";
import type { ScaffoldSdk } from "./scaffold-sdk";

export class PropertyInitializer<T extends ParamType> extends Promise<ParamTypeMap[T]> {
  private description: string;

  private isRequired = true;

  constructor(private key: string, private type: T, private runtime: ScaffoldSdk<any>) {
    let then: Function;
    super(() => then());
    then = () => this.evaluate();
  }

  descr(description: string) {
    this.description = description;
    return this;
  }

  optional() {
    this.isRequired = false;
    return this;
  }

  private async evaluate(): Promise<ParamTypeMap[T]> {
    console.log(`Evaluate ${this.key}`, this.description, this.isRequired);
    return null as any;
  }

  readonly [Symbol.toStringTag] = "[PropertyInitializer]";
}
