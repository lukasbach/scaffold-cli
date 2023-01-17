import noindent from "noindent";
import { createDefaultSdk } from "./default";
import { createEmptySdk } from "./empty";

export const createReactSdk = () => {
  const sdk = createEmptySdk();
  return sdk
    .withParameterSet("reactComponent", async () => [
      await sdk.param.string("componentName").asArgument().default("My Component"),
      await sdk.param.list("propsType").choices(["interface", "type", "inline"]).default("type"),
    ])
    .withPartial("propsType", (context, options) =>
      noindent(`
      {{#if interface}}
      {{#if exportPropsType}}export {{/if}}interface {{ pascalCase componentName }}Props {
        {{#if dummyProp}}dummy: string;{{/if}}
      }
      {{/if}}
      {{#if type}}
      {{#if exportPropsType}}export {{/if}}type {{ pascalCase componentName }}Props = {
        {{#if dummyProp}}dummy: string;{{/if}}
      }
      {{/if}}
    `)
    );
};
