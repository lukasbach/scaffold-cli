import * as sdks from "../sdks";
import { ScaffoldSdk } from "./scaffold-sdk";
import { MergedRuntimeData, RuntimeDataOf } from "../types";
import { RuntimeData } from "./types";

type NextBuilder<T extends RuntimeData, C extends () => ScaffoldSdk> = SdkBuilder<
  MergedRuntimeData<T, RuntimeDataOf<ReturnType<C>>>
>;

export class SdkBuilder<T extends RuntimeData> {
  private sdk = sdks.createEmptySdk();

  withDefaultCapabilities() {
    this.sdk.mergeWith(sdks.createDefaultSdk());
    return this as unknown as NextBuilder<T, typeof sdks.createDefaultSdk>;
  }

  withReactCapabilities() {
    this.sdk.mergeWith(sdks.createReactSdk());
    return this as unknown as NextBuilder<T, typeof sdks.createDefaultSdk>;
  }

  withTypeScriptCapabilities() {
    this.sdk.mergeWith(sdks.createTypescriptSdk());
    return this as unknown as NextBuilder<T, typeof sdks.createDefaultSdk>;
  }

  withJavaScriptCapabilities() {
    this.sdk.mergeWith(sdks.createJavascriptSdk());
    return this as unknown as NextBuilder<T, typeof sdks.createDefaultSdk>;
  }

  build() {
    return this.sdk as ScaffoldSdk<T>;
  }
}
