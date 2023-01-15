import "../../../src/globals";

(async () => {
  const sdk = createSdk();
  console.log("arguments:", await sdk.textArgument("first arg"), await sdk.numberArgument("second arg as number"));
  const value = await sdk.text("hello").descr("Description yay");
  const boolean = await sdk.boolean("boolean-value");
  await sdk.actions.addFile("template", "target");
  console.log(value, boolean);
  sdk.setDataProperty("asdf", 123);
})();
