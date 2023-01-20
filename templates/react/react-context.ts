import "../../src/globals";
import noindent from "noindent";

const typeTemplate = "{{> propsType }}";
const contextValueTemplate =
  'export const {{ pascalCase ctxName }} = {{ reactSymbol "createContext" }}<{{> propsName}}>(null);';
const hookTemplate =
  'export const use{{ pascalCase ctxName }} = () => {{ reactSymbol "useContext" }}({{ pascalCase ctxName }}{{ pascalCase contextVariableSuffix }});';

const providerTemplate = noindent(`
  export const {{ pascalCase ctxName }}Provider: {{ reactSymbol "FC" }} = props => {
    return (
      <{{ pascalCase ctxName }}
    );
  }
  {{> propsType }}
  `);

const withReactImport = (tpl: string) => `{{{ reactImportStatement }}}\n\n${tpl}`;

export default async () => {
  const sdk = scaffold.sdks
    .createDefaultSdk()
    .mergeWith(scaffold.sdks.createReactSdk())
    .mergeWith(scaffold.sdks.createJavascriptSdk());
  sdk.setTemplateName("React Context");
  sdk.setTemplateDescription("Description Text");
  sdk.setDataProperty("reactImports", ["FC"]); // TODO
  const ctxName = await sdk.param
    .string("ctxName")
    .required()
    .default("My Context")
    .descr("Name of the context")
    .asArgument();
  sdk.setDataProperty("propsName", ctxName);
  sdk.setDataProperty("propsName", ctxName);
  await sdk.param
    .string("propsTypeSuffix")
    .required()
    .default("ContextType")
    .descr('Suffix for the context type name. e.g. "type MyContextName*Suffix* = {..."')
    .asArgument();
  await sdk.param
    .string("contextVariableSuffix")
    .required()
    .default("Context")
    .descr('Suffix for the context instance variable name. e.g. "const MyContextName*Suffix* = createContext(..."')
    .asArgument();
  const fileExtension = await sdk.param.list("fileExtension").default("tsx").choices(["tsx", "ts", "jsx", "js"]);

  const placeTypeInDedicatedFile = await sdk.param
    .boolean("placeTypeInDedicatedFile")
    .default(false)
    .descr("Should the context props type be placed in a different file than the actual context instance?");

  const typeFileTemplate = !placeTypeInDedicatedFile
    ? ""
    : await sdk.param
        .string("typeFileTemplate")
        .default("{{ paramCase ctxName }}.type.{{ fileExtension }}")
        .descr("The name of the file that contains the context props type. May be a template string.");

  const placeHookInDedicatedFile = await sdk.param
    .boolean("placeHookInDedicatedFile")
    .default(false)
    .descr("Should the use-context hook be placed in a different file than the actual context instance?");

  const hookFileTemplate = !placeHookInDedicatedFile
    ? ""
    : await sdk.param
        .string("hookFileTemplate")
        .default("{{ paramCase ctxName }}.hook.{{ fileExtension }}")
        .descr("The name of the file that contains the use-context hook. May be a template string.");

  const placeProviderInDedicatedFile = await sdk.param
    .boolean("placeProviderInDedicatedFile")
    .default(false)
    .descr("Should the context provider be placed in a different file than the actual context instance?");

  const providerFileTemplate = !placeProviderInDedicatedFile
    ? ""
    : await sdk.param
        .string("providerFileTemplate")
        .default("{{ paramCase ctxName }}.provider.{{ fileExtension }}")
        .descr("The name of the file that contains the context provider. May be a template string.");

  const ctxFileTemplate =
    !placeTypeInDedicatedFile && !placeHookInDedicatedFile && !placeProviderInDedicatedFile
      ? "{{ paramCase ctxName }}.{{ fileExtension }}"
      : await sdk.param
          .string("providerFileTemplate")
          .default("{{ paramCase ctxName }}.context.{{ fileExtension }}")
          .descr("The name of the file that contains the context value. May be a template string.");

  await sdk.param.dummyProp();
  await sdk.param.exportPropsType();
  await sdk.param.importReactSymbols();
  await sdk.param.propsType().descr("Should the type for the context props be declared as type, interface, or inline?");
  const fileName = await sdk.actions.filenameParameters(componentName, ["tsx", "ts", "jsx", "js"]);
  await sdk.actions.addInlineTemplate(fileName, componentTemplate);
};
