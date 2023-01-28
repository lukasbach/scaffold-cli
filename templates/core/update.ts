import "../../src/globals";

export default async () => {
  const sdk = scaffold.sdk.build();
  sdk.setTemplateName("Update local template repositories");
  await sdk.do(async () => {
    for (const { localPath, isRemote } of scaffold.templateScope.getRepositories()) {
      if (isRemote) {
        await scaffold.templateScope.updateRepo(localPath);
      }
    }
  });
};
