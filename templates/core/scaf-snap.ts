import "../../src/globals";
import yaml from "write-yaml";
import path from "path";
import { fileNames } from "../../src/util";

export default async () => {
  const sdk = scaffold.sdks.createEmptySdk();
  sdk.setTemplateName("Create snapshot dumps for all scaffold templates in a template repository.");
  const repoName = await sdk.param
    .list("repoName")
    .descr("Templates repo to create snapshots for")
    .required()
    .choices(
      scaffold.templateScope
        .getRepositories()
        .filter(({ name }) => !!name)
        .map<any>(r => r.name)
    );
  const target = await sdk.param.string("output").descr("Output path").default("./.scaffold-snapshots");
  const failOnChange = await sdk.param
    .boolean("failOnChange")
    .descr("Process should fail when a snapshot is different than before")
    .default(false);
  await sdk.do(async () => {
    const repo = scaffold.templateScope.getRepositories().find(repo => repo.name === repoName);
    const templates = Object.entries(scaffold.templateScope.getTemplates()).filter(
      ([_, t]) => t.repoPath === repo?.localPath
    );
    for (const [templateKey, template] of templates) {
      scaffold.logger.debug(`Processing ${templateKey}...`);
      const output = {};
      await scaffold.introspection.resetParameterOverwrite();
      await scaffold.runner.introspectTemplate(template);
      const params = scaffold.introspection.getRegisteredParameters();
      const booleanParams = params.filter(p => p.type === "boolean");
      for (const booleanParam of booleanParams) {
        const snapshotKey = `${booleanParam.key}=${!booleanParam.default}`;
        output[snapshotKey] = {};
        await scaffold.introspection.resetParameterOverwrite();
        scaffold.introspection.setParameterOverwrite(booleanParam.key, !booleanParam.default);
        await scaffold.runner.introspectTemplate(template);
        for (const [file, content] of Object.entries(scaffold.introspection.getRegisteredOutputs())) {
          output[snapshotKey][file] = content;
        }
      }
      const tempFile = path.join(fileNames.tempDir, `${templateKey}.yaml`);
      const targetFile = path.join(target, `${templateKey}.yaml`);

      if (!targetFile) {
        scaffold.logger.error(`No target file given`);
        process.exit(1);
      }

      yaml.sync(tempFile, output);
      const newYaml = await fs.readFile(tempFile, { encoding: "utf8" });
      const oldYaml = await fs.readFile(targetFile, { encoding: "utf8" });

      if (newYaml !== oldYaml && failOnChange) {
        scaffold.logger.error(`Snapshot for ${templateKey} has changed`);
        process.exit(1);
      }

      await fs.writeFile(targetFile, newYaml);
      await fs.remove(tempFile);
    }
  });
};
