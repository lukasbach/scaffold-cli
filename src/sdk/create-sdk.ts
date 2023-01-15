import { ScaffoldSdk } from "./scaffold-sdk";

export const createSdk = () => {
  const sdk = new ScaffoldSdk<{ actions: {}; conditions: {}; data: {} }>();
  return sdk.withAction("addFile", (templateFile: string, target: string) => {
    console.log(templateFile, target);
  });
};
