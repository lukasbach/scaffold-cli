import { ImportDeclarationStructure, OptionalKind } from "ts-morph";
import { createEmptySdk } from "./empty";

export const createTypescriptSdk = () => {
  const sdk = createEmptySdk();
  return sdk.withActionSet({
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
  });
};
