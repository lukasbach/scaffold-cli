import "../../src/globals";
import yaml from "write-yaml";
import path from "path";
import { fileNames } from "../../src/util";
import { TemplateUsageDeclaration } from "../../src";

const snapTemplateConfig = async (template: TemplateUsageDeclaration) => {
  const output = {};
  await scaffold.runner.introspectTemplate(template);
  for (const [file, content] of Object.entries(scaffold.introspection.getRegisteredOutputs())) {
    output[file] = content;
  }
  return output;
};

export default async () => {
  const sdk = scaffold.sdk().build();
  sdk.setTemplateName("Create snapshot dumps for all scaffold templates in a template repository.");
  const repoKey = await sdk.param
    .list("repo")
    .descr("Templates repo to create snapshots for")
    .required()
    .choices(
      scaffold.templateScope
        .getRepositories()
        .filter(({ key }) => !!key)
        .filter(({ isRemote }) => !isRemote)
        .map<any>(r => r.key)
    );
  const target = await sdk.param.string("output").descr("Output path").default("./.scaffold-snapshots");
  const failOnChange = await sdk.param
    .boolean("failOnChange")
    .descr("Process should fail when a snapshot is different than before")
    .default(false);
  await sdk.do(async () => {
    const repo = scaffold.templateScope.getRepositories().find(repo => !repo.isRemote && repo.key === repoKey);
    const templates = Object.entries(scaffold.templateScope.getTemplates()).filter(
      ([, t]) => t.repoPath === repo?.localPath
    );
    for (const [templateKey, template] of templates) {
      const output: Record<string, object> = {};
      await scaffold.introspection.resetParameterOverwrite();
      await scaffold.runner.introspectTemplate(template);
      const params = scaffold.introspection.getRegisteredParameters();
      const booleanParams = params.filter(p => p.type === "boolean");

      await scaffold.introspection.resetParameterOverwrite();
      output.default = await snapTemplateConfig(template);

      for (const booleanParam of booleanParams) {
        const snapshotKey = `${booleanParam.key}=${!booleanParam.default}`;
        await scaffold.introspection.resetParameterOverwrite();
        scaffold.introspection.setParameterOverwrite(booleanParam.key, !booleanParam.default);
        output[snapshotKey] = await snapTemplateConfig(template);
      }

      const tempFile = path.join(fileNames.tempDir, `${templateKey}.yaml`);
      const targetFile = path.join(target, `${templateKey}.yaml`);
      const existsOldTemplate = fs.existsSync(targetFile);

      await fs.ensureDir(target);

      if (!targetFile) {
        scaffold.logger.error(`No target file given`);
        process.exit(1);
      }

      if (!existsOldTemplate && failOnChange) {
        scaffold.logger.error(`Snapshot for ${templateKey} did not exist before`);
        process.exit(1);
      }

      yaml.sync(tempFile, output);
      const newYaml = await fs.readFile(tempFile, { encoding: "utf8" });
      const oldYaml = existsOldTemplate ? await fs.readFile(targetFile, { encoding: "utf8" }) : "";

      if (newYaml !== oldYaml && failOnChange) {
        scaffold.logger.error(`ERR: Snapshot for ${templateKey} has changed`);
        process.exit(1);
      }

      if (!existsOldTemplate) {
        scaffold.logger.log(`Snapshot for ${templateKey} created the first time.`);
      } else if (newYaml !== oldYaml) {
        scaffold.logger.log(`Snapshot for ${templateKey} was changed and has been updated.`);
      } else {
        scaffold.logger.log(`Snapshot for ${templateKey} was unchanged.`);
      }

      await fs.writeFile(targetFile, newYaml);
      await fs.remove(tempFile);
    }
  });
};
