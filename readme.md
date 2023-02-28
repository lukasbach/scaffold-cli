# Scaffold CLI

> A templating tool for building reusable and configurable code templates in a central place.


## How to use

Install the package

```bash
npm install scaffold-cli --save
# or
yarn add scaffold-cli
```

TODO

TODO You can also [download a prebuilt binary](https://github.com/lukasbach/{NAME}/releases) and run that.

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
- [__Customize the default values for a template that is available in the current scope__: Description Text](/template-docs/core/customize.md)

  `scaf customize <template> [-g,--global] `
- [__Add a template repository to the template scope__: Description Text](/template-docs/core/add.md)

  `scaf add <repo> [-g,--global] `
- [__Edit global Scaffold Config file scoped to the local user__: Description Text](/template-docs/core/edit-config.md)

  `scaf edit-config `
- [__Initialize scaffold on a code repository__: Description Text](/template-docs/core/init.md)

  `scaf init --addToReadme --defaultRepos=# `
- [__List available templates__: Description Text](/template-docs/core/list.md)

  `scaf list `
- [__Create snapshot dumps for all scaffold templates in a template repository.__: Description Text](/template-docs/core/scaf-snap.md)

  `scaf scaf-snap --repo=# [--output=#] [--failOnChange] `
- [__Update local template repositories__: Description Text](/template-docs/core/update.md)

  `scaf update `


### React Templates

The following templates are available in the template scope when adding the `lukasbach/scaffold-cli/react` template repository.
- [__React Context__: Description Text](/template-docs/react/react-context.md)

  `scaf react-context <ctxName> [--propsTypeSuffix=#] [--contextVariableSuffix=#] [--fileExtension=#] [--placeTypeInDedicatedFile] [--placeHookInDedicatedFile] [--placeProviderInDedicatedFile] [--exportPropsType] [--dummyProp] [--importReactSymbols] [--deconstructProps] [--propsType=#] `
- [__React FC__: Description Text](/template-docs/react/react-fc.md)

  `scaf react-fc <componentName> [--dummyProp] [--exportPropsType] [--importReactSymbols] [--propsType=#] [--propsWithChildren] [--deconstructProps] [--filenameCase=#] [--fileExtension=#] `
- [__React Component with forwarded ref__: Description Text](/template-docs/react/react-forward-ref.md)

  `scaf react-forward-ref <componentName> [--elementType=#] [--innerRef=#] [--includeUseRef] [--includeUseImperativeHandle] [--dummyProp] [--exportPropsType] [--importReactSymbols] [--propsType=#] [--propsWithChildren] [--deconstructProps] [--filenameCase=#] [--fileExtension=#] `


<!-- /TEMPLATE_LIST -->

## How to develop

- `yarn` to install dependencies
- `yarn start` to run in dev mode
- `yarn test` to run tests
- `yarn lint` to test and fix linter errors

To publish a new version, the publish pipeline can be manually
invoked.
