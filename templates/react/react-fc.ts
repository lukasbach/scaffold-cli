import "../../src/globals";
import noindent from "noindent";

const componentTemplate = noindent(`
  {{{ reactImportStatement }}}
  
  {{> propsType }}
  
  export const {{ pascalCase componentName }}: {{ reactSymbol "FC" }}<{{> propsName }}> = props => {
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
  sdk.setDataProperty("reactImports", ["FC"]);
  const { componentName } = await sdk.actions.reactComponentParameters();
  const fileName = await sdk.actions.filenameParameters(componentName, ["tsx", "ts", "jsx", "js"]);
  await sdk.actions.addInlineTemplate(fileName, componentTemplate);
};
