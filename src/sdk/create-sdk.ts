import * as handlebars from "handlebars";
import { ScaffoldSdk } from "./scaffold-sdk";

export const createSdk = () => {
  const sdk = new ScaffoldSdk<{ actions: {}; conditions: {}; data: {} }>();
  return sdk.withAction("addFile", async (templateFile: string, target: string) => {
    const templateContents = await sdk.getTemplateFileContents(templateFile);
    const contents = handlebars.compile(templateContents)(sdk.getData());
    // TODO handlebars.registerHelper()
    const actualTarget = handlebars.compile(target)(sdk.getData());
    await sdk.writeToTarget(actualTarget, contents);
  });
};
