import "../../src/globals";

export default async () => {
  const sdk = scaffold.sdks.createEmptySdk();
  sdk.setTemplateName("List available templates");
  await sdk.do(async () => {
    Object.entries(scaffold.templateScope.getTemplates()).forEach(([templateName, template]) => {
      scaffold.logger.output(`- ${templateName}: ${template.source}`);
    });
  });
};
