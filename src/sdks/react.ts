import noindent from "noindent";
import { createEmptySdk } from "./empty";

export const createReactSdk = () => {
  const sdk = createEmptySdk();
  return sdk
    .withParameterList("reactComponent", async () => ({
      componentName: await sdk.param.string("componentName").asArgument().default("My Component"),
      propsType: await sdk.param.list("propsType").optional().choices(["interface", "type", "inline"]).default("type"),
      exportPropsType: await sdk.param.boolean("exportPropsType").optional().default(true),
    }))
    .withPartial(
      "propsType",
      noindent(`
        {{#ifEquals propsType "interface"}}
        {{#if exportPropsType}}export {{/if}}interface {{ pascalCase componentName }}Props {
          {{#if dummyProp}}dummy: string;{{/if}}
        }
        {{/ifEquals}}
        {{#ifEquals propsType "type"}}
        {{#if exportPropsType}}export {{/if}}type {{ pascalCase componentName }}Props = {
          {{#if dummyProp}}dummy: string;{{/if}}
        }
        {{/ifEquals}}
    `)
    );
};
