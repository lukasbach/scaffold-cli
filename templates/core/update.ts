import "../../src/globals";

export default async () => {
  const sdk = scaffold.sdk().build();
  sdk.setTemplateName("Update local template repositories");
  await sdk.do(async () => {
    for (const { isRemote, gitFolder } of scaffold.templateScope.getRepositories()) {
      if (isRemote && gitFolder) {
        await scaffold.templateScope.updateRepo(gitFolder);
      }
    }
  });
};
