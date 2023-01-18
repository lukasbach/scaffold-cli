import "../../src/globals";

export default async () => {
  const sdk = scaffold.sdks.createDefaultSdk();
  const addToReadme = sdk.param
    .boolean("addToReadme")
    .descr("Add scaffold usage instructions to readme?")
    .default(true)
    .required();
};
