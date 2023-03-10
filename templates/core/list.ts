import "../../src/globals";

export default async () => {
  const sdk = scaffold.sdk().build();
  sdk.setTemplateName("List templates");
  sdk.setTemplateDescription("List all available templates");
  await sdk.do(async () => {
    scaffold.logger.output("Available Templates");
    Object.entries(scaffold.templateScope.getTemplates())
      .filter(([, t]) => !t.repoMetaData?.internal)
      .forEach(([templateName]) => {
        scaffold.logger.output(`  ${templateName}`);
      });
    scaffold.logger.output("\nScaffold Commands");
    Object.entries(scaffold.templateScope.getTemplates())
      .filter(([, t]) => t.repoMetaData?.internal)
      .forEach(([templateName]) => {
        scaffold.logger.output(`  ${templateName}`);
      });
  });
};
