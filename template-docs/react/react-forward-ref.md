## Template React Forwarded Ref

> `scaf build-template-documentations <componentName> [--elementType=#] [--innerRef=#] [--includeUseRef] [--includeUseImperativeHandle] [--dummyProp] [--exportPropsType] [--importReactSymbols] [--propsType=#] [--propsWithChildren] [--deconstructProps] [--filenameCase=#] [--fileExtension=#] `

React Component with forwarded ref

### Parameters

* `elementType?`: _The HTML element type used for the forwarded ref_
  * Usage: `--elementType=#`
  * Default: `div`
* `innerRef?`: _The name of the variable used in the useRef call._
  * Usage: `--innerRef=#`
  * Default: `elementRef`
* `includeUseRef?`: _Include a call to React.useRef within the component to the forwarded ref._
  * Usage: `--includeUseRef`
  * Default: `true`
* `includeUseImperativeHandle?`: _Include a call to React.useImperativeHandle within the component with the forwarded ref._
  * Usage: `--includeUseImperativeHandle`
  * Default: `true`
* `componentName`: _The name of the React component_
  * Usage: argument
  * Default: `My Component`
* `dummyProp?`: _Include a sample prop in the component prop? This can help a subsequent linter fix call not to clear up the empty props type._
  * Usage: `--dummyProp`
* `exportPropsType?`: _Determines if the props type will be exported._
  * Usage: `--exportPropsType`
  * Default: `true`
* `importReactSymbols?`: _Import all react types and symboles used, like `FC`? If disabled, react symbols will be used like `React.FC`._
  * Usage: `--importReactSymbols`
* `propsType?`: _Use an interface, a type, or an inline type for the props type?_
  * Usage: `--propsType=#`
  * Choices: `inline`, `interface`, `type`
  * Default: `type`
* `propsWithChildren?`: _Include a children prop in the component props._
  * Usage: `--propsWithChildren`
  * Default: `true`
* `deconstructProps?`: _Deconstruct component props directly in the lambda parameters (`({ a, b }) => ...`) as opposed to using a single prop variable (`props => ...`)?_
  * Usage: `--deconstructProps`
  * Default: `true`
* `filenameCase?`: _Casing of the filename, e.g. camelCase or snake_case_
  * Usage: `--filenameCase=#`
  * Choices: `camelCase`, `pascalCase`, `snakeCase`, `paramCase`
  * Default: `paramCase`
* `fileExtension?`: _Extension of the file created_
  * Usage: `--fileExtension=#`
  * Choices: `js`, `jsx`, `ts`, `tsx`
  * Default: `tsx`

### Outputs

Outputs shown below are generated based on default inputs.
Change the values listed above to customize the results.

<details>
  <summary>my-component.tsx</summary>
  
```
import React from 'react';

export type MyComponentProps = {
  children: React.ReactNode

}

export const MyComponent = React.forwardRef<HTMLDivElement | null, MyComponentProps>((({  }), ref) => {
  const elementRef = React.useRef<HTMLDivElement>(null);
  React.useImperativeHandle<HTMLDivElement | null, {}>(
    ref,
    () => ({}),
    []
  );
  return (
    <div ref={elementRef}>
      hello
    </div>
  );
};
```
</details>

### Used Actions

When run in default settings, the following actions are used:

```
filenameParameters, addInlineTemplate, tsFormat
```