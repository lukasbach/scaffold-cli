import "../../src/globals";
import writeYaml from "write-yaml";

export default async () => {
  const sdk = scaffold.sdk().build();
  sdk.setTemplateName("Customize Template");
  sdk.setTemplateDescription("Customize the default values for a template that is available in the current scope");
  const template = await sdk.param
    .list("template")
    .descr("Template to customize")
    .asArgument()
    .choices(
      Object.entries(scaffold.templateScope.getTemplates())
        .filter(([, tpl]) => !tpl.repoMetaData?.internal)
        .map(([key]) => key)
    )
    .required()
    .asArgument();
  const globalFlag = await sdk.param
    .boolean("global")
    .short("g")
    .default(false)
    .descr("Add the template customization to the global scope instead of the nearest local scope.");
  await sdk.do(async () => {
    const templateData = Object.entries(scaffold.templateScope.getTemplates()).find(([key]) => key === template)?.[1];

    if (!templateData) {
      process.exit(1);
    }

    await scaffold.runner.introspectTemplate(templateData);
    const defaultValues = scaffold.introspection
      .getRegisteredParameters()
      .reduce((obj, param) => ({ ...obj, [param.key]: param.default }), {});

    const templateRoot = globalFlag
      ? scaffold.templateScope.getUserTemplateRoot()
      : scaffold.templateScope.getNearestTemplateRoot();
    const templateConfig = yaml.parse(await fs.readFile(templateRoot.path, { encoding: "utf-8" }));
    templateConfig.templates = templateConfig.templates || {};
    templateConfig.templates[template] = {
      source: templateData.sourceKey,
      defaults: defaultValues,
    };
    await writeYaml.sync(templateRoot.path, templateConfig);
    scaffold.logger.output(`Added customization values for template ${template} to ${templateRoot.path}`);
  });
};
