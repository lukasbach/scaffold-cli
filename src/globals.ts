/* eslint-disable no-var,vars-on-top */
import type { createSdk as createSdkFunc } from "./sdk/create-sdk";

declare global {
  var properties: Record<string, any>;
  var createSdk: typeof createSdkFunc;
}
