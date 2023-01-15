import "../../../src/globals";

(async () => {
  const sdk = createSdk();
  const value = await sdk.text("hello").optional().descr("Description yay");
  const boolean = await sdk.boolean("boolean-value").default(true);
  console.log(value, boolean);
})();
