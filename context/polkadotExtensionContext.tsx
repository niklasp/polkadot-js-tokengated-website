// component that returns a context provider for the polkadot extension
// this component is used in _app.tsx
//
// Path: context/polkadot-extension-context.tsx
import { createContext, ReactNode, useContext } from 'react';
import {
  usePolkadotExtension,
  UsePolkadotExtensionReturnType,
} from '@/hooks/use-polkadot-extension';

const PolkadotExtensionContext = createContext<UsePolkadotExtensionReturnType>({
  accounts: [],
  error: null,
  isReady: false,
  actingAccount: null,
  injector: null,
  setActingAccountIdx: () => {},
});

export const usePolkadotExtensionWithContext = () => useContext(PolkadotExtensionContext);

export const PolkadotExtensionContextProvider = ({ children }: { children: ReactNode }) => {
  const polkadotExtension = usePolkadotExtension();

  return (
    <PolkadotExtensionContext.Provider value={polkadotExtension}>
      {children}
    </PolkadotExtensionContext.Provider>
  );
};
