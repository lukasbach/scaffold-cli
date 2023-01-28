import * as sdks from "../sdks";
import { ScaffoldSdk } from "./scaffold-sdk";
import { RuntimeData } from "./types";

export class SdkBuilder<T extends RuntimeData> {
  constructor(private sdk: ScaffoldSdk<T>) {}

  withDefaultCapabilities() {
    return this.with(sdks.createDefaultSdk());
  }

  withReactCapabilities() {
    return this.with(sdks.createReactSdk());
  }

  withTypeScriptCapabilities() {
    return this.with(sdks.createTypescriptSdk());
  }

  withJavaScriptCapabilities() {
    return this.with(sdks.createJavascriptSdk());
  }

  build() {
    return this.sdk as ScaffoldSdk<T>;
  }

  private with<O extends RuntimeData>(sdk: ScaffoldSdk<O>) {
    return new SdkBuilder(this.sdk.mergeWith(sdk));
  }
}
