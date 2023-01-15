import "../../../src/globals";

(async () => {
  const sdk = createSdk();

  console.log("arguments:", await sdk.argument.string("first arg"), await sdk.argument.number("second arg as number"));
  console.log("options:", await sdk.option.string("string"), await sdk.option.number("number").default(""));
  const value = await sdk.text("hello").descr("Description yay");
  const boolean = await sdk.boolean("boolean-value");
  await sdk.actions.addFile("template", "target");
  console.log(value, boolean);
  sdk.setDataProperty("asdf", 123);
})();
