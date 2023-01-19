import "../../src/globals";

export default async () => {
  const sdk = scaffold.sdks.createDefaultSdk();
  sdk.setTemplateName("Update local template repositories");
  await sdk.do(async () => {
    for (const { localPath, isRemote } of scaffold.templateScope.getRepositories()) {
      if (isRemote) {
        await git.default(localPath).pull();
        console.log(`Pulled ${localPath}`);
      }
    }
  });
};
