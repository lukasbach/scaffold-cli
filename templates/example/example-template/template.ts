import "../../../src/globals";

(async () => {
  const sdk = createSdk();
  const value = await sdk.text("hello").optional().descr("Description yay")
  console.log(value)
})();
