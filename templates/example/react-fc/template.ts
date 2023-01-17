import "../../../src/globals";

(async () => {
  const sdk = sdks.createDefaultSdk().mergeWith(sdks.createReactSdk());
  sdk.setDataProperty("a.b.c", 123);
  console.log("data is ", sdk.getData());
  console.log(sdk.helper.camelCase("Hello World this is a captial case test"));
  await sdk.actions.tsAddImport("src/util.ts", {
    moduleSpecifier: "module spec",
    defaultImport: "defaultimp",
    namedImports: [{ name: "named1" }, { name: "named2" }],
  });
})();
