import { createContext, useEffect, useState } from "react";
import type { InjectedAccountWithMeta, InjectedExtension, InjectedWindow } from "@polkadot/extension-inject/types";
import { useRouter } from 'next/router'

type PolkadotExtensionContextType = {
    accounts: any[];
    actingAccountId: number;
    injector: InjectedExtension | undefined;
    awaitingExtensionPermission: boolean;
}

export const PolkadotExtensionContext = 
    createContext<PolkadotExtensionContextType>({} as PolkadotExtensionContextType);

export const PolkadotExtensionProvider = ( props ) => {
    const [accounts, setAccounts] = useState<InjectedAccountWithMeta[]>([]);
    const [actingAccountId, setActingAccountId] = useState<number>(0);
    const [awaitingExtensionPermission, setAwaitingExtensionPermission] = useState<boolean>(true);
    const [injector, setInjector] = useState<InjectedExtension>();
    const [allowExtensionConnection, setAllowExtensionConnection] = useState<boolean>(true);

    const router = useRouter()

    const Accounts = async () => {

      console.log( 'entering accounts async', awaitingExtensionPermission,  )
      
      const { web3Accounts, web3Enable, web3FromAddress, web3AccountsSubscribe } = await import(
        "@polkadot/extension-dapp"
      );
      // returns an array of all the injected sources
      // (this needs to be called first, before other requests)
      
      const allInjected = await web3Enable('Tokengated Polkadot Demo');
      const allAccounts = await web3Accounts();

      if ( allInjected.length > 0 && allAccounts.length === 0 ) {
        router.reload()
      } else {

      }

      console.log( 'allInjected', allInjected )

      // WARNING: this will reload the page if the extension is not installed and is a hack to get around the fact that
      // the promise does not resolve properly with dynamic imports
      if (allInjected && allInjected.length > 0 ) {
        setAwaitingExtensionPermission( false )

        // returns an array of { address, meta: { name, source } }
        // meta.source contains the name of the extension that provides this account
        const allAccounts = await web3Accounts();
        setAccounts( allAccounts )
    
        if ( allAccounts.length > 0 ) {
          // the address we use to use for signing, as injected
        
          // finds an injector for an address
          const injector = await web3FromAddress(allAccounts[0].address);
          setInjector( injector )
        } else {
          router.reload()
        }
      }
    }
  
    useEffect(() => {
      Accounts()
    }, [ ])

    return (
        <PolkadotExtensionContext.Provider value={ { accounts, actingAccountId, injector } }>
            {props.children}
        </PolkadotExtensionContext.Provider>
    )
}