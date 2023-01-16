import * as changeCase from "change-case";
import { ScaffoldSdk } from "./scaffold-sdk";

export const createSdk = () => {
  const sdk = new ScaffoldSdk<{ actions: {}; conditions: {}; data: {}; helpers: {}; partials: {} }>();
  return sdk
    .withAction("addFile", async (templateFile: string, target: string) => {
      const templateContents = await sdk.getTemplateFileContents(templateFile);
      await sdk.writeToTarget(sdk.fillTemplate(target), sdk.fillTemplate(templateContents));
    })
    .withAction("addInlineTemplate", async (target: string, template: string) => {
      await sdk.writeToTarget(sdk.fillTemplate(target), sdk.fillTemplate(template));
    })
    .withAction("replaceInFile", async (target: string, regex: RegExp | string, replaceWith: string) => {
      const targetPath = sdk.fillTemplate(target);
      const originalContents = await sdk.getTemplateFileContents(targetPath);
      const replacedContents = originalContents.replace(regex, replaceWith);
      await sdk.writeToTarget(targetPath, replacedContents);
    })
    .withHelper("camelCase", changeCase.camelCase)
    .withHelper("capitalCase", changeCase.capitalCase)
    .withHelper("constantCase", changeCase.constantCase)
    .withHelper("dotCase", changeCase.dotCase)
    .withHelper("headerCase", changeCase.headerCase)
    .withHelper("noCase", changeCase.noCase)
    .withHelper("paramCase", changeCase.paramCase)
    .withHelper("pascalCase", changeCase.pascalCase)
    .withHelper("pathCase", changeCase.pathCase)
    .withHelper("sentenceCase", changeCase.sentenceCase)
    .withHelper("snakeCase", changeCase.snakeCase);
};
