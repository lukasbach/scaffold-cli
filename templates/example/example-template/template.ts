import "../../../src/globals";

(async () => {
  const sdk = createSdk();

  console.log("arguments:", await sdk.argument.string("first-arg"), await sdk.argument.number("second arg as number"));
  console.log("options:", await sdk.option.string("string"), await sdk.option.number("number").default(""));
  sdk.setDataProperty("a.b.c", 123);
  console.log("data is ", sdk.getData());
  console.log(sdk.helper.camelCase("Hello World this is a captial case test"));
  await sdk.actions.addFile("template-file.md", "{{first-arg}}.md");
})();
