import noindent from "noindent";
import { createEmptySdk } from "./empty";

export const createReactSdk = () => {
  const sdk = createEmptySdk();
  return sdk
    .withParameterList("reactComponent", async () => ({
      componentName: await sdk.param.string("componentName").asArgument().default("My Component"),
      propsType: await sdk.param.list("propsType").optional().choices(["interface", "type", "inline"]).default("type"),
      exportPropsType: await sdk.param.boolean("exportPropsType").optional().default(true),
      dummyProp: await sdk.param.boolean("dummyProp").optional().default(false),
      importReactSymbols: await sdk.param.boolean("importReactSymbols").optional().default(false),
    }))
    .withHelperSet({
      reactImportStatement(options) {
        const { reactImports, importReactSymbols } = options.data.root;
        if (!reactImports) {
          throw new Error("reactImports helper used without a reactImports data variable");
        }
        if (reactImports.length === 0 || !importReactSymbols) {
          return "import React from 'react';";
        }
        return `import React, { ${reactImports.join(", ")} } from "react";`;
      },
      reactSymbol(symbolName, options) {
        return options.data.root.importReactSymbols ? symbolName : `React.${symbolName}`;
      },
    })
    .withPartialSet({
      propsType: noindent(`
        {{#ifEquals propsType "interface"}}
        {{#if exportPropsType}}export {{/if}}interface {{ pascalCase componentName }}Props {
          {{#if dummyProp}}dummy: string;{{/if}}
        }
        {{/ifEquals}}
        {{#ifEquals propsType "type"}}
        {{#if exportPropsType}}export {{/if}}type {{ pascalCase componentName }}Props = {
          {{#if dummyProp}}dummy: string;{{/if}}
        }
        {{/ifEquals}}
    `),
      propsName: "{{ pascalCase componentName }}Props",
    });
};
