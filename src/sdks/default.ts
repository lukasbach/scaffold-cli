import { ImportDeclarationStructure, OptionalKind } from "ts-morph";
import * as changeCase from "change-case";
import { createEmptySdk } from "./empty";

const caseWrapper = (handler: (v: string) => string) => (original: string) =>
  original ? handler(original) : "NOT_FOUND";

export const createDefaultSdk = () => {
  const sdk = createEmptySdk();
  return sdk
    .withHelperSet({
      ifEquals(arg1, arg2, options) {
        if (arguments.length !== 3) {
          throw new Error("#ifEquals requires exactly 2 arguments");
        }
        return arg1 === arg2 ? options.fn(this) : options.inverse(this);
      },
      unlessEquals(arg1, arg2, options) {
        if (arguments.length !== 3) {
          throw new Error("#unlessEquals requires exactly 2 arguments");
        }
        return arg1 !== arg2 ? options.fn(this) : options.inverse(this);
      },
    })
    .withActionSet({
      filenameParameters: async (symbolName: string, extensions: string[]) => {
        const filenameCase = await sdk.param
          .list("filenameCase")
          .descr("Casing of the filename, e.g. camelCase or snake_case")
          .default("paramCase")
          .choices([
            { value: "camelCase", name: "camelCase.ext" },
            { value: "pascalCase", name: "PascalCase.ext" },
            { value: "snakeCase", name: "snake_case.ext" },
            { value: "paramCase", name: "param-case.ext" },
          ]);
        const fileExtension = await sdk.param
          .list("fileExtension")
          .descr("Extension of the file created")
          .default("tsx")
          .choices(extensions);
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
        if (sdk.isIntrospectionRun) {
          return;
        }

        const file = await sdk.getTsSourceFile(target);
        file.addImportDeclaration(importDecl);
        await file.save();
        sdk.registerChangedFiles(target);
      },
      tsOrganizeImports: async (target: string) => {
        if (sdk.isIntrospectionRun) {
          return;
        }

        const file = await sdk.getTsSourceFile(target);
        file.organizeImports();
        await file.save();
        sdk.registerChangedFiles(target);
      },
      tsAddListItem: async (target: string) => {
        if (sdk.isIntrospectionRun) {
          return;
        }

        const file = await sdk.getTsSourceFile(target);
        console.log(file?.getAncestors());
        sdk.registerChangedFiles(target);
      },
      tsFormat: async () => {
        if (sdk.isIntrospectionRun) {
          return;
        }

        (await Promise.all(sdk.getChangedFiles().map(file => sdk.getTsSourceFile(file)))).forEach(file =>
          file?.formatText()
        );
      },
      eslint: async () => {
        if (sdk.isIntrospectionRun) {
          return;
        }

        await $(`npx eslint --fix ${sdk.getChangedFiles().join(" ")}`);
      },
    })
    .withHelperSet({
      camelCase: caseWrapper(changeCase.camelCase),
      capitalCase: caseWrapper(changeCase.capitalCase),
      constantCase: caseWrapper(changeCase.constantCase),
      dotCase: caseWrapper(changeCase.dotCase),
      headerCase: caseWrapper(changeCase.headerCase),
      noCase: caseWrapper(changeCase.noCase),
      paramCase: caseWrapper(changeCase.paramCase),
      pascalCase: caseWrapper(changeCase.pascalCase),
      pathCase: caseWrapper(changeCase.pathCase),
      sentenceCase: caseWrapper(changeCase.sentenceCase),
      snakeCase: caseWrapper(changeCase.snakeCase),
      curly(options) {
        return new sdk.hb.SafeString(`{${options.fn(this)}}`).toString();
      },
    });
};
