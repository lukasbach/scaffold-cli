import React from 'react';

export type HelloWorldContextType = {

}
export const HelloWorldContext = React.createContext<HelloWorldContextType>(null as any); // FIXME
export const useHelloWorld = () => React.useContext(HelloWorldContext);
export const HelloWorldProvider: React.FC = ({  }) => {
  return (
    <HelloWorldContext.Provider value={null as any}>
      
    </HelloWorldContext.Provider>
  );
}