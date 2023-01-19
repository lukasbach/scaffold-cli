import { ImportDeclarationStructure, OptionalKind } from "ts-morph";
import * as changeCase from "change-case";
import { createEmptySdk } from "./empty";

export const createDefaultSdk = () => {
  const sdk = createEmptySdk();
  return sdk
    .withHelper("ifEquals", function ifEquals(arg1, arg2, options) {
      if (arguments.length !== 3) {
        throw new Error("#if requires exactly one argument");
      }
      return arg1 === arg2 ? options.fn(this) : options.inverse(this);
    })
    .withActionSet({
      filenameParameters: async (symbolName: string, extensions: string[]) => {
        const filenameCase = await sdk.param
          .list("filenameCase")
          .default("paramCase")
          .choices([
            { value: "camelCase", name: "camelCase.ext" },
            { value: "pascalCase", name: "PascalCase.ext" },
            { value: "snakeCase", name: "snake_case.ext" },
            { value: "paramCase", name: "param-case.ext" },
          ]);
        const fileExtension = await sdk.param.list("fileExtension").default("tsx").choices(extensions);
        return `${sdk.helper[filenameCase](symbolName)}.${fileExtension}`;
      },
      addFile: async (templateFile: string, target: string) => {
        const templateContents = await sdk.getTemplateFileContents(templateFile);
        await sdk.writeToTarget(sdk.fillTemplate(target), sdk.fillTemplate(templateContents));
      },
      addInlineTemplate: async (target: string, template: string) => {
        await sdk.writeToTarget(sdk.fillTemplate(target), sdk.fillTemplate(template));
      },
      replaceInFile: async (target: string, regex: RegExp | string, replaceWith: string) => {
        const targetPath = sdk.fillTemplate(target);
        const originalContents = await sdk.getTemplateFileContents(targetPath);
        const replacedContents = originalContents.replace(regex, replaceWith);
        await sdk.writeToTarget(targetPath, replacedContents);
      },
      tsAddImport: async (target: string, importDecl: OptionalKind<ImportDeclarationStructure>) => {
        const file = await sdk.getTsSourceFile(target);
        file.addImportDeclaration(importDecl);
        await file.save();
        sdk.registerChangedFiles(target);
      },
      tsOrganizeImports: async (target: string) => {
        const file = await sdk.getTsSourceFile(target);
        file.organizeImports();
        await file.save();
        sdk.registerChangedFiles(target);
      },
      tsAddListItem: async (target: string) => {
        const file = await sdk.getTsSourceFile(target);
        console.log(file?.getAncestors());
        sdk.registerChangedFiles(target);
      },
      tsFormat: async () => {
        (await Promise.all(sdk.getChangedFiles().map(file => sdk.getTsSourceFile(file)))).forEach(file =>
          file?.formatText()
        );
      },
      eslint: async () => {
        await $(`npx eslint --fix ${sdk.getChangedFiles().join(" ")}`);
      },
    })
    .withHelperSet({
      camelCase: changeCase.camelCase,
      capitalCase: changeCase.capitalCase,
      constantCase: changeCase.constantCase,
      dotCase: changeCase.dotCase,
      headerCase: changeCase.headerCase,
      noCase: changeCase.noCase,
      paramCase: changeCase.paramCase,
      pascalCase: changeCase.pascalCase,
      pathCase: changeCase.pathCase,
      sentenceCase: changeCase.sentenceCase,
      snakeCase: changeCase.snakeCase,
    });
};
