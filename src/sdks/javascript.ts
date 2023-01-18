/* eslint-disable prefer-rest-params */
import { createEmptySdk } from "./empty";

export const createJavascriptSdk = () => {
  const sdk = createEmptySdk();
  return sdk
    .withHelperSet({
      namedImport() {
        const parameterCount = arguments.length - 1;
        const moduleName = arguments[0];
        const imports = Array.from(arguments).slice(1, parameterCount);
        return `import { ${imports.join(", ")} } from "${moduleName}";`;
      },
      defaultImport(exportName, moduleName) {
        return `import ${exportName} from "${moduleName}";`;
      },
      namespaceImport(exportName, moduleName) {
        return `import * as ${exportName} from "${moduleName}";`;
      },
      sideeffectImport(moduleName) {
        return `import "${moduleName}";`;
      },
    })
    .withActionSet({
      eslint: async () => {
        await $(`npx eslint --fix ${sdk.getChangedFiles().join(" ")}`);
      },
    });
};
