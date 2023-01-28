# Scaffold CLI

> A templating tool for building reusable and configurable code templates in a central place.


## How to use

Install globally via

    npm install -g {NAME}

or directly use via

    npx {NAME}

TODO You can also [download a prebuilt binary](https://github.com/lukasbach/{NAME}/releases) and run that.

Usage:

    Usage: npx {NAME} [options]

    Options:
    -V, --version            output the version number
    -s, --small              small pizza size
    -p, --pizza-type <type>  flavour of pizza
    -h, --help               display help for command

## How to use

Install the package

```bash
npm install {NAME} --save
# or
yarn add {NAME}
```

Import the package and use it

```typescript jsx
import {NAME} from '{NAME}'

render(
  <{NAME} 
    myProp={42}
  />
)
```

## Available Templates
<!-- TEMPLATE_LIST -->
### Core Templates

The following templates are available in the template scope when adding the `lukasbach/scaffold-cli/core`
template repository.
- [__Edit global Scaffold Config file scoped to the local user__: Description Text](/template-docs/core/edit-config.md)

  `scaf edit-config `
- [__Initialize scaffold on a code repository__: Description Text](/template-docs/core/init.md)

  `scaf init --addToReadme --defaultRepos=# `
- [__List available templates__: Description Text](/template-docs/core/list.md)

  `scaf list `
- [__Create snapshot dumps for all scaffold templates in a template repository.__: Description Text](/template-docs/core/scaf-snap.md)

  `scaf scaf-snap --repoName=# [--output=#] [--failOnChange] `
- [__Update local template repositories__: Description Text](/template-docs/core/update.md)

  `scaf update `


### React Templates

The following templates are available in the template scope when adding the `lukasbach/scaffold-cli/react`
template repository.
- [__List available templates__: undefined](/template-docs/react/input-tests.md)

  `scaf input-tests --string=# --number=# --list=# --checkbox=# --password=# --boolean --confirm=# --editor=# `
- [__React Context__: Description Text](/template-docs/react/react-context.md)

  `scaf react-context <ctxName> [<propsTypeSuffix>] [<contextVariableSuffix>] [--fileExtension=#] [--placeTypeInDedicatedFile] [--placeHookInDedicatedFile] [--placeProviderInDedicatedFile] [--exportPropsType] [--dummyProp] [--importReactSymbols] [--deconstructProps] [--propsType=#] `
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
