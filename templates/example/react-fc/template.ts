import "../../../src/globals";
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
  sdk.setDataProperty("reactImports", ["FC"]);
  const { componentName } = await sdk.parameterLists.reactComponent();
  const filenameCase = await sdk.param
    .list("filenameCase")
    .optional()
    .default("paramCase")
    .choices([
      { value: "camelCase", name: "camelCase.ext" },
      { value: "pascalCase", name: "PascalCase.ext" },
      { value: "snakeCase", name: "snake_case.ext" },
      { value: "paramCase", name: "param-case.ext" },
    ]);
  const fileExtension = await sdk.param
    .list("fileExtension")
    .optional()
    .default("tsx")
    .choices(["tsx", "ts", "jsx", "js"]);
  const fileName = `${sdk.helper[filenameCase](componentName)}.${fileExtension}`;
  await sdk.actions.addInlineTemplate(fileName, componentTemplate);
};
