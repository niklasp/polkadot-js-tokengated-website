import { createContext, useEffect, useState } from "react";
import type { InjectedAccountWithMeta, InjectedExtension, InjectedWindow } from "@polkadot/extension-inject/types";
import { isEqual } from 'lodash';
import { isDeepStrictEqual } from "util";

type PolkadotExtensionContextType = {
    accounts: any[];
    actingAccountIdx: number;
    setActingAccountIdx: (idx: number) => void;
    setActingAccountByAddress: (address: string) => void;
    injector: InjectedExtension | undefined;
    isWeb3Injected: boolean;
}

export const PolkadotExtensionContext = 
    createContext<PolkadotExtensionContextType>({} as PolkadotExtensionContextType);

export const PolkadotExtensionProvider = ( props ) => {
    const [accounts, setAccounts] = useState<InjectedAccountWithMeta[]>([]);
    const [actingAccountIdx, setActingAccountIdx] = useState<number>(0);
    const [isWeb3Injected, setIsWeb3Injected] = useState<boolean>(false);
    const [injector, setInjector] = useState<InjectedExtension>();
    const [sources, setSources] = useState<any[]>([]);

    const setActingAccountByAddress = (address: string) => {
      setActingAccountIdx( accounts.findIndex( account => account.address === address ) )
    }

    const Accounts = async () => {      
      const { web3Accounts, web3Enable, web3FromAddress, web3AccountsSubscribe, web3EnablePromise, isWeb3Injected, } = await import(
        "@polkadot/extension-dapp"
      );

      setIsWeb3Injected( isWeb3Injected )
      // returns an array of all the injected sources
      // (this needs to be called first, before other requests)
      
      
      const allInjected = await web3Enable('Tokengated Polkadot Demo')
      const sources = await web3EnablePromise

      console.log( 'sources', sources )

      if ( allInjected.length === 0 ) {
        console.info('No extension found')
        return
      }

      const allAccounts = await web3Accounts()

      if ( ! isEqual ( accounts, allAccounts ) ) {
        setAccounts( allAccounts )
      }

      // we can use web3FromSource which will return an InjectedExtension type
      if ( allAccounts.length > 0 ) {      
        // finds an injector for an address
        const injector = await web3FromAddress(allAccounts[0].address);
        setInjector( injector )
      }
    }
  
    useEffect(() => {
      Accounts()
    }, [ sources ])

    return (
        <PolkadotExtensionContext.Provider value={ { 
          accounts,
          actingAccountIdx,
          setActingAccountIdx,
          setActingAccountByAddress,
          injector,
          isWeb3Injected,
        } }>
            {props.children}
        </PolkadotExtensionContext.Provider>
    )
}