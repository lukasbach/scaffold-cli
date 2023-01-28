import "../../src/globals";
import noindent from "noindent";

const reposToDocument = ["core", "react"];

export default async () => {
  const sdk = scaffold.sdk().build();
  sdk.setTemplateName("List available templates");
  await sdk.do(async () => {
    const templates = Object.entries(scaffold.templateScope.getTemplates()).filter(([_, template]) =>
      reposToDocument.includes(template.repoMetaData?.key ?? "")
    );

    const summaryDataFiles = reposToDocument.reduce<Record<string, string>>(
      (obj, repoKey) => ({
        ...obj,
        [repoKey]: noindent(`
        # ${repoKey[0].toUpperCase() + repoKey.slice(1)} Templates
        
        The following templates are available in the template scope when adding the \`lukasbach/scaffold-cli/${repoKey}\`
        template repository.
        
        `),
      }),
      {}
    );

    for (const [templateName, template] of templates) {
      console.log(`Building ${templateName}...`);
      await scaffold.runner.introspectTemplate(template);
      await scaffold.introspection.documentTemplate(`./template-docs/${template.repoMetaData?.key}/${templateName}.md`);
      const introData = scaffold.introspection.getIntrospectionData();
      summaryDataFiles[template.repoMetaData?.key ?? ""] +=
        `- [__${introData.templateName}__: ${introData.templateDescription}]` +
        `(/template-docs/${template.repoMetaData?.key}/${templateName}.md)` +
        `\n\n  \`${scaffold.introspection.getInvokeCommandSnippet(templateName)}\`\n`;
    }

    for (const [repoKey, summaryData] of Object.entries(summaryDataFiles)) {
      await fs.writeFile(path.join(`./template-docs/${repoKey}/index.md`), summaryData);
    }
  });
};
