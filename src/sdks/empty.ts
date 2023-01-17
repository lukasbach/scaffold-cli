import { ScaffoldSdk } from "../sdk/scaffold-sdk";

export const createEmptySdk = () =>
  new ScaffoldSdk<{ actions: {}; conditions: {}; data: {}; helpers: {}; partials: {}; parameterSets: {} }>();
