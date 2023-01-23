import "../../src/globals";

const forPermutations = async (
  values: string[],
  runPermutation: (permutation: Record<string, boolean>) => Promise<any>
) => {
  for (let i = 0; i < 2 ** values.length; i++) {
    const permutation = values.reduce(
      (perm, value, k) => ({
        ...perm,
        // eslint-disable-next-line no-bitwise
        [value]: ((i >> k) & 1) === 1,
      }),
      {}
    );
    await runPermutation(permutation);
  }
};

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
  sdk.param.string("output").descr("Output path").default("./.scaffold-snapshots");
  await sdk.do(async () => {
    const repo = scaffold.templateScope.getRepositories().find(repo => repo.name === repoName);
    const templates = Object.entries(scaffold.templateScope.getTemplates()).filter(
      ([_, t]) => t.repoPath === repo?.localPath
    );
    for (const [templateKey, template] of templates) {
      scaffold.logger.debug(`Processing ${templateKey}...`);
      await scaffold.introspection.resetParameterOverwrite();
      await scaffold.runner.introspectTemplate(template);
      const params = scaffold.introspection.getRegisteredParameters();
      const booleanParams = params.filter(p => p.type === "boolean").map(p => p.key);
      await forPermutations(booleanParams, async permutation => {
        console.log(permutation);
      });
    }
  });
};
