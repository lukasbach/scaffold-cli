import "../../src/globals";
import path from "path";
import noindent from "noindent";

const defaultContent = noindent(`
  repositories:
    - lukasbach/scaffold-cli/templates/example
  `);

export default async () => {
  const sdk = scaffold.sdk().build();
  sdk.setTemplateName("Edit Config");
  sdk.setTemplateDescription("Edit global Scaffold Config file scoped to the local user");
  await sdk.do(async () => {
    const file = path.join(os.homedir(), ".scaf.yml");
    const contents = (await fs.exists(file)) ? await fs.readFile(file, { encoding: "utf-8" }) : defaultContent;
    const edited = await sdk.param.editor("config").required().default(contents);
    await fs.writeFile(file, edited);
    console.log(`Saved config to ${file}`);
  });
};
