import { ReactNode, createContext, useEffect, useState } from "react";
import type { InjectedAccountWithMeta, InjectedExtension, InjectedWindow } from "@polkadot/extension-inject/types";
import { isDeepStrictEqual } from "util";
// import { web3Accounts, web3Enable, web3FromAddress, web3AccountsSubscribe, web3EnablePromise, isWeb3Injected } from "@polkadot/extension-dapp";
import { WalletAccount, getWallets, isWalletInstalled } from "@talismn/connect-wallets";

type PolkadotExtensionContextType = {
    accounts: WalletAccount[] | undefined;
    actingAccountIdx: number | undefined;
    setActingAccountIdx: (idx: number) => void;
    setActingAccountByAddress: (address: string) => void;
    injector: InjectedExtension | undefined;
    isWeb3Injected: boolean;
}

export const PolkadotExtensionContext = 
    createContext<PolkadotExtensionContextType>({} as PolkadotExtensionContextType);

export const PolkadotExtensionProvider = ( { children } : { children : ReactNode }) => {
  const [ initialized, setInitialized ] = useState<boolean>( false )
  const [accounts, setAccounts] = useState<WalletAccount[] | undefined>([]);
  const [actingAccountIdx, setActingAccountIdx] = useState<number | undefined>( undefined );
  const [isWeb3Injected, setIsWeb3Injected] = useState<boolean>(false);
  const [injector, setInjector] = useState<InjectedExtension>();

  const setActingAccountByAddress = (address: string) => {
    setActingAccountIdx( accounts?.findIndex( account => account.address === address ) )
  }

  const Accounts = async () => {      
    if (typeof window !== "undefined" ) {
      const installedWallets = getWallets().filter(wallet => wallet.installed)
      const firstWallet = installedWallets[0]
      
      // enable the wallet
      if (firstWallet) {
        try {
          await firstWallet.enable( "nextjs connect" )
          if ( ! isWeb3Injected ) {
            const unsubscribe = await firstWallet.subscribeAccounts((allAccounts: WalletAccount[] | undefined) => {
                console.log("got accounts via talisman connect", allAccounts)
                setAccounts( allAccounts )
                setActingAccountIdx( 0 )
            });
          }
          setIsWeb3Injected( true )
        } catch (error) {
          console.log( error )
        } 
      } 
    }
  }

  Accounts()

  return (
      <PolkadotExtensionContext.Provider value={ { 
        accounts,
        actingAccountIdx,
        setActingAccountIdx,
        setActingAccountByAddress,
        injector,
        isWeb3Injected,
      } }>
          {children}
      </PolkadotExtensionContext.Provider>
  )
}