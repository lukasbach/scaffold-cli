import "../../src/globals";

export default async () => {
  Object.entries(scaffold.templateScope.getTemplates()).forEach(([templateName, template]) => {
    scaffold.logger.output(`- ${templateName}: ${template.source}`);
  });
};
