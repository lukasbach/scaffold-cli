## Template Initialize

> `scaf build-template-documentations --addToReadme --defaultRepos=# `

Initialize a scaffold config on a code repository

### Parameters

* `addToReadme`: _Add scaffold usage instructions to readme?_
  * Usage: `--addToReadme`
  * Default: `true`
* `defaultRepos`: _Do you want to add any suggested templates repositories?_
  * Usage: `--defaultRepos=#`
  * Choices: `lukasbach/scaffold-cli/templates/web`, `lukasbach/scaffold-cli/templates/test`, `lukasbach/scaffold-cli/templates/react`, `lukasbach/scaffold-cli/templates/monorepo`

### Outputs

Outputs shown below are generated based on default inputs.
Change the values listed above to customize the results.

<details>
  <summary>./.scaf.yml</summary>
  
```
# List template repositories here. All templates in this repo will be added to the scaffold
# template scope. A template repository path is either a local path to a folder containing
# a "scaffold-templates.yml" file, or a github repo path of the form 
# "githubUser/githubRepo/path/to/folder" where this folder contains a "scaffold-templates.yml" file.
repositories:

# You can customize individual templates by specifying default values for parameter. A default
# value specified here will prevent scaffold from asking the parameter when calling the template
# within this repo.
# With the template-keys, you can either overwrite existing templates, or define new keys for templates
# that use an existing template as source.
# As an example, uncomment the code below and run `scaffold myReactRcTemplate`
templates:
  # myReactRcTemplate:
  #   source: lukasbach/scaffold-cli/templates/react/react-fc
  #   defaults:
  #     propsType: interface
  #     importReactSymbols: true
```
</details>
<details>
  <summary>./readme.md</summary>
  
```


## Scaffold Templates

You can use [scaffold-cli](https://github.com/lukasbach.com/scaffold-cli) to generate new files from
templates.

```bash
# Install with
npm i -g @lukasbach/scaffold

# To create a new file from a template:
scaf template-name

# List available templates:
scaf list
```
```
</details>

### Used Actions

When run in default settings, the following actions are used:

```

```