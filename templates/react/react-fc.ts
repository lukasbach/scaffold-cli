import "../../src/globals";
import noindent from "noindent";
import { isNotNullish } from "../../src/util";

const componentTemplate = noindent(`
  {{{ reactImportStatement }}}
  
  {{> propsType }}
  
  export const {{ pascalCase componentName }}: {{ reactSymbol "FC" }}<{{> propsName }}> = {{ propsArguments }} => {
    return (
      <>
        hello
      </>
    );
  };
  `);

export default async () => {
  const sdk = scaffold.sdks
    .createDefaultSdk()
    .mergeWith(scaffold.sdks.createReactSdk())
    .mergeWith(scaffold.sdks.createJavascriptSdk());
  sdk.setTemplateName("React FC");
  sdk.setTemplateDescription("Description Text");
  const componentName = await sdk.param.componentName();
  await sdk.param.dummyProp();
  await sdk.param.exportPropsType();
  await sdk.param.importReactSymbols();
  await sdk.param.propsType();
  const withChildren = await sdk.param.propsWithChildren();
  await sdk.param.deconstructProps();
  sdk.setDataProperty("reactImports", ["FC", withChildren ? "ReactNode" : null].filter(isNotNullish));
  sdk.setDataProperty("propsTypeSuffix", "Props");
  const fileName = await sdk.actions.filenameParameters(componentName, ["tsx", "ts", "jsx", "js"]);
  await sdk.actions.addInlineTemplate(fileName, componentTemplate);
};
