import "../../src/globals";
import writeYaml from "write-yaml";

export default async () => {
  const sdk = scaffold.sdk().build();
  sdk.setTemplateName("Add Template Repo");
  sdk.setTemplateDescription("Add a template repository to the template scope");
  const repo = await sdk.param
    .string("repo")
    .descr('Path to the repo to add, in the form of "githubuser/reponame/path/to/folder"')
    .required()
    .asArgument();
  const globalFlag = await sdk.param
    .boolean("global")
    .short("g")
    .default(false)
    .descr("Add the template repo to the global scope instead of the nearest local scope.");
  await sdk.do(async () => {
    const templateRoot = globalFlag
      ? scaffold.templateScope.getUserTemplateRoot()
      : scaffold.templateScope.getNearestTemplateRoot();
    const templateConfig = yaml.parse(await fs.readFile(templateRoot.path, { encoding: "utf-8" }));
    templateConfig.repositories = templateConfig.repositories || [];
    templateConfig.repositories.push(repo);
    await writeYaml.sync(templateRoot.path, templateConfig);
    scaffold.logger.output(`Added ${repo} to ${templateRoot.path}`);
  });
};
