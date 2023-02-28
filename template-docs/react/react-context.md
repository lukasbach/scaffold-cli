## Template React Context

> `scaf build-template-documentations <ctxName> [--propsTypeSuffix=#] [--contextVariableSuffix=#] [--fileExtension=#] [--placeTypeInDedicatedFile] [--placeHookInDedicatedFile] [--placeProviderInDedicatedFile] [--exportPropsType] [--dummyProp] [--importReactSymbols] [--deconstructProps] [--propsType=#] `

Description Text

### Parameters

* `ctxName`: _Name of the context_
  * Usage: argument
  * Default: `Hello World`
* `propsTypeSuffix?`: _Suffix for the context type name. e.g. "type MyContextName*Suffix* = {..."_
  * Usage: `--propsTypeSuffix=#`
  * Default: `ContextType`
* `contextVariableSuffix?`: _Suffix for the context instance variable name. e.g. "const MyContextName*Suffix* = createContext(..."_
  * Usage: `--contextVariableSuffix=#`
  * Default: `Context`
* `fileExtension?`
  * Usage: `--fileExtension=#`
  * Choices: `tsx`, `ts`, `jsx`, `js`
  * Default: `tsx`
* `placeTypeInDedicatedFile?`: _Should the context props type be placed in a different file than the actual context instance?_
  * Usage: `--placeTypeInDedicatedFile`
* `placeHookInDedicatedFile?`: _Should the use-context hook be placed in a different file than the actual context instance?_
  * Usage: `--placeHookInDedicatedFile`
* `placeProviderInDedicatedFile?`: _Should the context provider be placed in a different file than the actual context instance?_
  * Usage: `--placeProviderInDedicatedFile`
* `exportPropsType?`: _Determines if the props type will be exported._
  * Usage: `--exportPropsType`
  * Default: `true`
* `dummyProp?`: _Include a sample prop in the component prop? This can help a subsequent linter fix call not to clear up the empty props type._
  * Usage: `--dummyProp`
* `importReactSymbols?`: _Import all react types and symboles used, like `FC`? If disabled, react symbols will be used like `React.FC`._
  * Usage: `--importReactSymbols`
* `deconstructProps?`: _Deconstruct component props directly in the lambda parameters (`({ a, b }) => ...`) as opposed to using a single prop variable (`props => ...`)?_
  * Usage: `--deconstructProps`
  * Default: `true`
* `propsType?`: _Should the type for the context props be declared as type, interface, or inline?_
  * Usage: `--propsType=#`
  * Choices: `interface`, `type`, `inline`
  * Default: `type`

### Outputs

Outputs shown below are generated based on default inputs.
Change the values listed above to customize the results.

<details>
  <summary>hello-world.tsx</summary>
  
```
import React from 'react';

export type HelloWorldContextType = {

}
export const HelloWorldContext = React.createContext<HelloWorldContextType>(null as any); // FIXME
export const useHelloWorld = () => React.useContext(HelloWorldContext);
export const HelloWorldProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <HelloWorldContext.Provider value={null as any}>
      { children }
    </HelloWorldContext.Provider>
  );
}
```
</details>

### Used Actions

When run in default settings, the following actions are used:

```
addInlineTemplate, tsFormat
```