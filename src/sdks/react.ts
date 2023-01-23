import noindent from "noindent";
import { createEmptySdk } from "./empty";

export const createReactSdk = () => {
  const sdk = createEmptySdk();
  return sdk
    .withParameterTemplateSet({
      componentName: () =>
        sdk.param
          .string("componentName")
          .asArgument()
          .required()
          .default("My Component")
          .descr("The name of the React component"),
      propsType: () =>
        sdk.param
          .list("propsType")
          .choices(["interface", "type", "inline"])
          .default("type")
          .descr(
            "The template will create a TypeScript type for the component props. This will determine " +
              "whether the props type will be declared as interface, type, or inlined into the FC type generic parameter."
          ),
      exportPropsType: () =>
        sdk.param.boolean("exportPropsType").default(true).descr("Determines if the props type will be exported."),
      dummyProp: () =>
        sdk.param
          .boolean("dummyProp")
          .default(false)
          .descr(
            "If enabled, a sample property will be included in the prop type. This can help a subsequent " +
              "linter fix call not to clear up the empty props type."
          ),
      propsWithChildren: () =>
        sdk.param.boolean("propsWithChildren").default(true).descr("Include a children prop in the component props."),
      importReactSymbols: () =>
        sdk.param
          .boolean("importReactSymbols")
          .default(false)
          .descr(
            "If disabled, react symbols will be used like `React.FC`. If enabled, all react types and " +
              "symbols used will be imported and directly used, like `FC`."
          ),
      deconstructProps: () =>
        sdk.param
          .boolean("deconstructProps")
          .default(true)
          .descr(
            "Deconstruct component props directly in the lambda parameters (`({ a, b }) => ...`) " +
              "as opposed to using a single prop variable (`props => ...`)"
          ),
    })
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
      reactSymbol(symbolName: string, options) {
        return options.data.root.importReactSymbols ? symbolName : `React.${symbolName}`;
      },
      propsArguments() {
        const options = [...arguments][arguments.length - 1];
        const props = [...arguments].slice(0, arguments.length - 2);
        return options.data.root.deconstructProps ? `({ ${props.join(", ")} })` : "props";
      },
      prop(name: string, options) {
        return options.data.root.deconstructProps ? name : `props.${name}`;
      },
    })
    .withPartialSet({
      propsContents:
        "{{#if dummyProp}}dummy: string\n{{/if}}" +
        '{{#if propsWithChildren}}children: {{ reactSymbol "ReactNode" }}\n{{/if}}',
      propsType: noindent(`
        {{#ifEquals propsType "interface"}}
        {{#if exportPropsType}}export {{/if}}interface {{ pascalCase componentName }}{{ propsTypeSuffix }} {
          {{> propsContents}}
        
        }
        {{/ifEquals}}
        {{#ifEquals propsType "type"}}
        {{#if exportPropsType}}export {{/if}}type {{ pascalCase componentName }}{{ propsTypeSuffix }} = {
          {{> propsContents}}
        
        }
        {{/ifEquals}}
      `),
      propsName:
        '{{#ifEquals propsType "inline"}}{{#curly}} {{> propsContents}} {{/curly}}{{/ifEquals}}' +
        '{{#unlessEquals propsType "inline"}}{{ pascalCase componentName }}{{ propsTypeSuffix }}{{/unlessEquals}}',
    });
};
