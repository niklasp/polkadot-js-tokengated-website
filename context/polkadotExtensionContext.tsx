import { ReactNode, createContext, useEffect, useState } from "react";
import type { InjectedExtension } from "@polkadot/extension-inject/types";
import { SubscriptionFn, WalletAccount, getWallets, isWalletInstalled } from "@talismn/connect-wallets";

type PolkadotExtensionContextType = {
    accounts: WalletAccount[] | undefined;
    actingAccountIdx: number | undefined;
    setActingAccountIdx: (idx: number) => void;
    setActingAccountByAddress: (address: string) => void;
    injector: InjectedExtension | undefined;
    isInitialized: boolean;
}

export const PolkadotExtensionContext = 
    createContext<PolkadotExtensionContextType>({} as PolkadotExtensionContextType);

export const PolkadotExtensionProvider = ( { children } : { children : ReactNode }) => {
  const [isInitialized, setIsInitialized ] = useState<boolean>( false )
  const [accounts, setAccounts] = useState<WalletAccount[] | undefined>([]);
  const [actingAccountIdx, setActingAccountIdx] = useState<number | undefined>( undefined );
  const [isWeb3Injected, setIsWeb3Injected] = useState<boolean>(false);
  const [injector, setInjector] = useState<InjectedExtension>();

  const setActingAccountByAddress = (address: string) => {
    setActingAccountIdx( accounts?.findIndex( account => account.address === address ) )
  }

  const initWalletExtension = async () => {      
    if (typeof window !== "undefined" ) {
      const installedWallets = getWallets().filter(wallet => wallet.installed)
      const firstWallet = installedWallets[0]

      // enable the wallet
      try {
        await firstWallet?.enable( "Polkadot Tokengated Demo" )
        if ( accounts === undefined || accounts.length === 0 ) {
          await firstWallet.subscribeAccounts((allAccounts: WalletAccount[] | undefined) => {
              console.log("got accounts via talisman connect", allAccounts)
              setAccounts( allAccounts )
              setActingAccountIdx( 0 )
          });
        }
      } catch (error) {
        console.log( error )
      } 
      setIsInitialized( true )
    }
  }

  initWalletExtension()

  return (
      <PolkadotExtensionContext.Provider value={ { 
        accounts,
        actingAccountIdx,
        setActingAccountIdx,
        setActingAccountByAddress,
        injector,
        isInitialized,
      } }>
          {children}
      </PolkadotExtensionContext.Provider>
  )
}