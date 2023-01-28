import "../../src/globals";

export default async () => {
  const sdk = scaffold.sdk().withDefaultCapabilities().build();
  const choices = ["a", "b", "c"];
  await sdk.param.string("string").descr("string Value").default("Default Value").required();
  await sdk.param.number("number").descr("number Value").default(43).required();
  await sdk.param.list("list").descr("list Value").default("a").required().choices(choices);
  await sdk.param.checkbox("checkbox").descr("checkbox Value").default(["a", "b"]).required().choices(choices);
  // await sdk.param.expand("expand").descr("expand Value").default("0").required().choices(choices);
  await sdk.param.password("password").descr("password Value").default("Default Value").required();
  await sdk.param.boolean("boolean").descr("boolean Value").default(true).required();
  await sdk.param.confirm("confirm").descr("confirm Value").default(true).required();
  await sdk.param.editor("editor").descr("editor Value").default("Default Value").required();
};
