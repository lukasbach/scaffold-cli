import "../../../src/globals";

(async () => {
  const sdk = createSdk();

  // console.log(
  //   "arguments:",
  //   await sdk.argument.string("first-arg", { default: "asd" }),
  //   await sdk.argument.number("second arg as number", { default: 123 })
  // );
  sdk.setDataProperty("a.b.c", 123);
  console.log("data is ", sdk.getData());
  console.log(sdk.helper.camelCase("Hello World this is a captial case test"));
  await sdk.actions.tsAddImport("src/util.ts", {
    moduleSpecifier: "module spec",
    defaultImport: "defaultimp",
    namedImports: [{ name: "named1" }, { name: "named2" }],
  });
  // await sdk.actions.tsAddListItem("src/index.ts");
  await sdk.actions.tsSave();
  // await sdk.actions.eslint();
  // await sdk.actions.addFile("template-file.md", "{{first-arg}}.md");
})();
