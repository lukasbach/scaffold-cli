import noindent from "noindent";
import { createEmptySdk } from "./empty";

export const createReactSdk = () => {
  const sdk = createEmptySdk();
  return sdk.withPartial("propsType", (context, options) =>
    noindent(`
      {{#if interface}}
      {{#if exportInterface}}export {{/if}}interface {{ pascalCase componentName }}Props {
        {{#if dummyProp}}dummy: string;{{/if}}
      }
      {{/if}}
      {{#if type}}
      {{#if exportType}}export {{/if}}type {{ pascalCase componentName }}Props = {
        {{#if dummyProp}}dummy: string;{{/if}}
      }
      {{/if}}
    `)
  );
};
