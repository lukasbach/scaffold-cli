import "../../src/globals";
import noindent from "noindent";
import { isNotNullish } from "../../src/util";

const componentTemplate = noindent(`
  {{{ reactImportStatement }}}
  
  {{> propsType }}
  
  export const {{ pascalCase componentName }} = {{ reactSymbol "forwardRef" }}<HTML{{ pascalCase elementType }}Element | null, {{> propsName }}>(({{ propsArguments }}, ref) => {
    {{#if includeUseRef}}const {{ innerRef }} = {{ reactSymbol "useRef"}}<HTML{{ pascalCase elementType }}Element>(null);{{/if}}
    {{#if includeUseImperativeHandle}}{{ reactSymbol "useImperativeHandle" }}<HTML{{ pascalCase elementType }}Element | null, {}>(
      ref,
      () => ({}),
      []
    );{{/if}}
    return (
      <{{ elementType }} ref={{#curly}}{{#if includeUseRef}}{{ innerRef }}{{/if}}{{#unless includeUseRef}}ref{{/unless}}{{/curly}}>
        hello
      </{{ elementType }}>
    );
  };
  `);

export default async () => {
  const sdk = scaffold.sdk().withDefaultCapabilities().withReactCapabilities().withJavaScriptCapabilities().build();
  sdk.setTemplateName("React Component with forwarded ref");
  sdk.setTemplateDescription("Description Text");
  await sdk.param.string("elementType").default("div").descr("The HTML element type used for the forwarded ref");
  await sdk.param.string("innerRef").default("elementRef").descr("The name of the variable used in the useRef call.");
  const includeUseRef = await sdk.param
    .boolean("includeUseRef")
    .default(true)
    .descr("Include a call to React.useRef within the component to the forwarded ref.");
  const includeUseImperativeHandle = await sdk.param
    .boolean("includeUseImperativeHandle")
    .default(true)
    .descr("Include a call to React.useImperativeHandle within the component with the forwarded ref.");
  sdk.setDataProperty(
    "reactImports",
    ["forwardRef", includeUseRef ? "useRef" : null, includeUseImperativeHandle ? "useImperativeRef" : null].filter(
      isNotNullish
    )
  );
  const componentName = await sdk.param.componentName();
  await sdk.param.dummyProp();
  await sdk.param.exportPropsType();
  await sdk.param.importReactSymbols();
  await sdk.param.propsType();
  const withChildren = await sdk.param.propsWithChildren();
  await sdk.param.deconstructProps();
  sdk.setDataProperty("propsTypeSuffix", "Props");
  sdk.setDataProperty(
    "reactImports",
    [
      "forwardRef",
      withChildren ? "ReactNode" : null,
      includeUseRef ? "useRef" : null,
      includeUseImperativeHandle ? "useImperativeHandle" : null,
    ].filter(isNotNullish)
  ); // TODO
  const fileName = await sdk.actions.filenameParameters(componentName, ["tsx", "ts", "jsx", "js"]);
  await sdk.actions.addInlineTemplate(fileName, componentTemplate);
};
