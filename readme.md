# Scaffold CLI

> A templating tool for building reusable and configurable code templates in a central place.

![Scaffold CLI Demo](./demo.gif "Scaffold CLI Demo")

## How to use

Install the package

```bash
npm i -g @lukasbach/scaffold
```

You can get started by adding the official react templates to the global template scope,
and creating a react FC file:

```bash
scaf add lukasbach/scaffold-cli/templates/react
scaf react-fc "My Component Name"
```

If you want to further customize how the template works, you could 

* Provide additional parameters:
  ```bash
  scaf react-fc "My Component Name" --propsType inline --propsWithChildren false
  ```
* Require scaffold to interactively ask for *all* parameters:
  ```bash
  scaf react-fc --all
  ```
* Create an alias or redefinition of an existing template with custom config values:
  ```bash
  scaf customize react-fc -g
  scaf edit-config
  ```
  
  Adds a custom template overwrite such as:
  ```yaml 
  templates:
    react-fc:
      source: ./templates/react/react-fc
      defaults:
        componentName: My Component
        dummyProp: false
        exportPropsType: true
        importReactSymbols: false
        propsType: type
        propsWithChildren: true
        deconstructProps: true
        filenameCase: paramCase
        fileExtension: tsx
      omitActions:
        - tsFormat
      postActions:
        - eslint
  ```
  
You can not only add and redefine templates globally, but also scoped to specific projects
on your disk. Run

```bash
scaf init
```

in your project repository to create a scaffold config file and from there on customize templates
scoped to your repository.

## Available Templates

To add a template to the current scope, run `scaf add githubuser/reponame/path/to/templaterepo`. This
will add the available templates to the nearest `.scaf.yml`. You can add `--global` to add it to your user
config. 

Generally, all parameters are optional when running a parameter. Parameters below marked with `[--param]` will
use preset default values if not provided, parameters marked with `--param` will ask the user in an interactive
prompt for the intended value before evaluating the template.

You can customize the default values for any template with `scaf customize template-name [--global]`.

<!-- TEMPLATE_LIST -->
### Core Templates

The following templates are core commands which are available by default.
- [__Add Template Repo__: Add a template repository to the template scope](/template-docs/core/add.md)

  `scaf add <repo> [-g,--global] `
- [__Customize Template__: Customize the default values for a template that is available in the current scope](/template-docs/core/customize.md)

  `scaf customize <template> [-g,--global] `
- [__Edit Config__: Edit global Scaffold Config file scoped to the local user](/template-docs/core/edit-config.md)

  `scaf edit-config `
- [__Initialize__: Initialize a scaffold config on a code repository](/template-docs/core/init.md)

  `scaf init --addToReadme --defaultRepos=# `
- [__List templates__: List all available templates](/template-docs/core/list.md)

  `scaf list `
- [__Create Snapshots__: Create snapshot dumps for all scaffold templates in a template repository.](/template-docs/core/scaf-snap.md)

  `scaf scaf-snap --repo=# [--output=#] [--failOnChange] `
- [__Update templates__: Update local template repositories](/template-docs/core/update.md)

  `scaf update `


### React Templates

The following templates are available in the template scope when adding the `lukasbach/scaffold-cli/react` template repository.
- [__React Context__: A React context instance with context provider, hook and context type](/template-docs/react/react-context.md)

  `scaf react-context <ctxName> [--propsTypeSuffix=#] [--contextVariableSuffix=#] [--fileExtension=#] [--placeTypeInDedicatedFile] [--placeHookInDedicatedFile] [--placeProviderInDedicatedFile] [--exportPropsType] [--dummyProp] [--importReactSymbols] [--deconstructProps] [--propsType=#] `
- [__React FC__: React Functional Component](/template-docs/react/react-fc.md)

  `scaf react-fc <componentName> [--dummyProp] [--exportPropsType] [--importReactSymbols] [--propsType=#] [--propsWithChildren] [--deconstructProps] [--filenameCase=#] [--fileExtension=#] `
- [__React Forwarded Ref__: React Component with forwarded ref](/template-docs/react/react-forward-ref.md)

  `scaf react-forward-ref <componentName> [--elementType=#] [--innerRef=#] [--includeUseRef] [--includeUseImperativeHandle] [--dummyProp] [--exportPropsType] [--importReactSymbols] [--propsType=#] [--propsWithChildren] [--deconstructProps] [--filenameCase=#] [--fileExtension=#] `


<!-- /TEMPLATE_LIST -->

## Writing your own templates

### Setting up your template repository

Within your repository, create a folder, let's name it "templates", and in there,
create the files `scaffold-templates.yml` and `my-template.ts`.

```
my-repo/
  templates/
    scaffold-templates.yml
    my-template.ts
    my-other-template.ts
    my-template-with-assets/
      template.ts
      some-asset.json
  [.scaf.yml]
```

The `scaffold-templates.yml` file should contain the following content:

```yaml
name: My Templates
description: Description Text
author: Lukas Bach
key: templates-key
```

We will look into how the template code looks like in the next section.
There are multiple ways how to make the templates available:

* If you want them available within your project, add and edit the `.scaf.yml`
  file mentioned in the file tree above in the top level of your project with
  the following content:

  ```yaml
  repositories:
  - ./templates
  ```
  
  You can also add more template repositories, either from your own machine or
  remotely.
* If you want them available everywhere on your machine, add the Yaml code
  above to `~/.scaf.yml`. You can edit that file by running `scaf edit-config`.
* If you want them available on other machines, or publish them for other developers
  to use, create a git repository from your project, and push it to `gh-user-name/my-repo`.
  Then, use the following yaml code in a `.scaf.yml` file to reference the templates:

  ```yaml
  repositories:
  - gh-user-name/my-repo/templates
  ```
  
  This will automatically pull the repo when calling the template. The repo can be private,
  but needs to be pullable by your local git installation.

### Writing a template

This is an example for a template implementation:

```ts
// Import is optional and provides type-safety for scaffold library.
// Install "@lukasbach/scaffold" as dev dependency in your project for that.
import "@lukasbach/scaffold/globals"

export default async () => {
  const sdk = scaffold.sdk().withDefaultCapabilities().build();
  sdk.setTemplateName("React FC");
  sdk.setTemplateDescription("React Functional Component");
  
  const componentName = await sdk.param
    .string("componentName")
    .asArgument()
    .default("My Component")
  
  // custom side effects like fs operations should be wrapped in sdk.do()
  await sdk.do(async () => {
    // Some packages like fs-extra, execa (as $), yaml, os or git are available
    // in global scope
    const v = (await fs.readJSON("package.json")).version
  });
  
  // Accessible in templates via {{ myData.packageJson.version }}
  sdk.setDataProperty("myData.packageJson.version", v)
  
  // Apply handlebars template and add file to fs
  // SDK-related functions are internally wrapped and don't explicitly need to
  // be wrapped with sdk.do()
  await sdk.actions.addFile("{{ camelCase componentName }}", "component.ts.hbl")
}
```

If your template just consists of code, you can add this code to
`templates/my-template.ts`. If you want to add additional files like the 
`component.ts.hbl` file referenced above, add your template code to
`templates/my-template/template.ts`.

You can use handlebar templates in template files used by scaffold, so
`templates/my-template/component.ts.hbl` could look like that:

```
/** template version v{{ myData.packageJson.version }} */
const {{ pascalCase componentName }} = () => <div />;
```

You can look into official templates in the [/templates](https://github.com/lukasbach/scaffold-cli/tree/main/templates)
folder for more examples.

### Running your template

Once the template is added to your `.scaf.yml` and you finished the code,
just run `scaf my-template`. You don't need to build anything, scaffold
will compile your template on the fly.

### Customizing existing templates

In your `.scaf.yml` file, you can customize existing templates by predefining
parameters:

```yaml
repositories:
  - ./templates
templates:
  template-with-predefined-component-name:
    source: ./templates/react/my-template
    defaults:
      componentName: Box
```

You can create this quickly by running `scaf customize`.
  

## How to develop

- `yarn` to install dependencies
- `yarn start` to run the CLI
- `yarn lint` to test and fix linter errors
- `yarn test` to check if template outputs have changed

To publish a new version, `npm publish --access=public` is currently used.
