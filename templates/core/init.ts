import "../../src/globals";
import noindent from "noindent";

const template = noindent(`
  # List template repositories here. All templates in this repo will be added to the scaffold
  # template scope. A template repository path is either a local path to a folder containing
  # a "scaffold-templates.yml" file, or a github repo path of the form 
  # "githubUser/githubRepo/path/to/folder" where this folder contains a "scaffold-templates.yml" file.
  repositories:
  {{#each defaultRepos}}  - {{this}}
  {{/each}}
  
  # You can customize individual templates by specifying default values for parameter. A default
  # value specified here will prevent scaffold from asking the parameter when calling the template
  # within this repo.
  # With the template-keys, you can either overwrite existing templates, or define new keys for templates
  # that use an existing template as source.
  # As an example, uncomment the code below and run \`scaffold myReactRcTemplate\`
  templates:
    # myReactRcTemplate:
    #   source: lukasbach/scaffold-cli/templates/react/react-fc
    #   defaults:
    #     propsType: interface
    #     importReactSymbols: true
  `);

// TODO include additional top-level config attributes: defaults, preActions, postActions, skipActions

const readmeAddition = noindent(`
  ## Scaffold Templates
  
  You can use [scaffold-cli](https://github.com/lukasbach.com/scaffold-cli) to generate new files from
  templates.
  
  \`\`\`bash
  # Install with
  npm i -g @lukasbach/scaffold
  
  # To create a new file from a template:
  scaf template-name
  
  # List available templates:
  scaf list
  \`\`\`
  `);

export default async () => {
  const sdk = scaffold.sdk().build();
  sdk.setTemplateName("Initialize");
  sdk.setTemplateDescription("Initialize a scaffold config on a code repository");
  const addToReadme = await sdk.param
    .boolean("addToReadme")
    .descr("Add scaffold usage instructions to readme?")
    .default(true)
    .required();
  await sdk.param
    .checkbox("defaultRepos")
    .descr("Do you want to add any suggested templates repositories?")
    .default([])
    .required()
    .choices([
      // "lukasbach/scaffold-cli/templates/web", // TODO packagejson, github actions, github community standards, webpack?, tsconfig,
      // "lukasbach/scaffold-cli/templates/test",
      "lukasbach/scaffold-cli/templates/react", // TODO hook file, redux?, storybook,
      // "lukasbach/scaffold-cli/templates/monorepo",
    ]);

  // TODO offer to prepare local template folder
  // TODO offer to create files without comments and examples

  await sdk.writeToTarget("./.scaf.yml", sdk.fillTemplate(template));
  if (addToReadme) {
    await sdk.appendWriteToTarget("./readme.md", `\n\n${readmeAddition}`);
  }
};
