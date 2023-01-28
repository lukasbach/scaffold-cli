import "../../src/globals";
import noindent from "noindent";
import { isNotNullish } from "../../src/util";

const typeTemplate = "{{> propsType }}";
const contextValueTemplate =
  'export const {{ contextVariable }} = {{ reactSymbol "createContext" }}<{{> propsName }}>(null as any); // FIXME';
const hookTemplate =
  'export const use{{ pascalCase ctxName }} = () => {{ reactSymbol "useContext" }}({{ contextVariable }});';

const providerTemplate = noindent(`
  export const {{ pascalCase ctxName }}Provider: {{ reactSymbol "FC" }}<{ children: {{ reactSymbol "ReactNode" }} }> = {{ propsArguments "children" }} => {
    return (
      <{{ contextVariable }}.Provider value={null as any}>
        { {{ prop "children" }} }
      </{{ contextVariable }}.Provider>
    );
  }
  `);

const withReactImport = (prefix: string, tpl: string) => `${prefix}{{{ reactImportStatement }}}\n\n${tpl}`;

export default async () => {
  const sdk = scaffold.sdk().withDefaultCapabilities().withReactCapabilities().withJavaScriptCapabilities().build();
  sdk.setTemplateName("React Context");
  sdk.setTemplateDescription("Description Text");

  const ctxName = await sdk.param
    .string("ctxName")
    .required()
    .default("Hello World")
    .descr("Name of the context")
    .asArgument();
  sdk.setDataProperty("componentName", ctxName);
  await sdk.param
    .string("propsTypeSuffix")
    .default("ContextType")
    .descr('Suffix for the context type name. e.g. "type MyContextName*Suffix* = {..."');
  await sdk.param
    .string("contextVariableSuffix")
    .default("Context")
    .descr('Suffix for the context instance variable name. e.g. "const MyContextName*Suffix* = createContext(..."');

  await sdk.param.list("fileExtension").default("tsx").choices(["tsx", "ts", "jsx", "js"]);

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

  const typeFile = sdk.fillTemplate(placeTypeInDedicatedFile ? typeFileTemplate : ctxFileTemplate);
  const typeFileImportModule = path.basename(typeFile, path.extname(typeFile));

  const ctxFile = sdk.fillTemplate(ctxFileTemplate);
  const ctxFileImportModule = path.basename(ctxFile, path.extname(typeFile));

  // TODO what for? sdk.setDataProperty("propsName", ctxName);
  // sdk.withPartial("contextVariable", "{{ pascalCase ctxName }}{{ pascalCase contextVariableSuffix }}");
  sdk.withHelper("contextVariable", () =>
    sdk.fillTemplate("{{ pascalCase ctxName }}{{ pascalCase contextVariableSuffix }}")
  );

  if (placeTypeInDedicatedFile) {
    sdk.setDataProperty("exportPropsType", true);
  } else {
    await sdk.param.exportPropsType();
  }

  await sdk.param.dummyProp();
  await sdk.param.importReactSymbols();
  await sdk.param.deconstructProps();
  await sdk.param.propsType().descr("Should the type for the context props be declared as type, interface, or inline?");

  if (placeTypeInDedicatedFile) {
    await sdk.actions.addInlineTemplate(typeFileTemplate, withReactImport("", typeTemplate));
  }

  if (placeHookInDedicatedFile) {
    sdk.setDataProperty("reactImports", ["useContext"]);
    await sdk.actions.addInlineTemplate(
      hookFileTemplate,
      withReactImport(`{{{ namedImport "${ctxFileImportModule}" (contextVariable) }}}\n`, hookTemplate)
    );
  }

  if (placeProviderInDedicatedFile) {
    sdk.setDataProperty("reactImports", ["FC", "ReactNode"]);
    await sdk.actions.addInlineTemplate(
      providerFileTemplate,
      withReactImport(`{{{ namedImport "${ctxFileImportModule}" (contextVariable) }}}\n`, providerTemplate)
    );
  }

  sdk.setDataProperty(
    "reactImports",
    [
      !placeTypeInDedicatedFile ? "ReactNode" : null,
      !placeHookInDedicatedFile ? "useContext" : null,
      !placeProviderInDedicatedFile ? "FC" : null,
      !placeProviderInDedicatedFile ? "ReactNode" : null,
      "createContext",
    ].filter(isNotNullish)
  );

  const combinedValueTemplate = [
    !placeTypeInDedicatedFile ? typeTemplate : `import { {{> propsName}} } from '${typeFileImportModule}';`,
    contextValueTemplate,
    !placeHookInDedicatedFile ? hookTemplate : null,
    !placeProviderInDedicatedFile ? providerTemplate : null,
  ]
    .filter(isNotNullish)
    .join("\n");

  await sdk.actions.addInlineTemplate(ctxFileTemplate, withReactImport("", combinedValueTemplate));
};
