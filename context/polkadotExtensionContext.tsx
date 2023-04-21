import { ReactNode, createContext, useEffect, useState } from "react";
import type { InjectedExtension, InjectedAccountWithMeta, InjectedWindow } from "@polkadot/extension-inject/types";
import { SubscriptionFn, WalletAccount, getWallets, isWalletInstalled } from "@talismn/connect-wallets";

type PolkadotExtensionContextType = {
    accounts: InjectedAccountWithMeta[];
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
  const [accounts, setAccounts] = useState<InjectedAccountWithMeta[]>([]);
  const [actingAccountIdx, setActingAccountIdx] = useState<number | undefined>( undefined );
  const [isWeb3Injected, setIsWeb3Injected] = useState<boolean>(false);
  const [injector, setInjector] = useState<InjectedExtension>();
  const [ allowExtensionConnection, setAllowExtensionConnection ] = useState<boolean>( false )

  const setActingAccountByAddress = (address: string) => {
    setActingAccountIdx( accounts?.findIndex( account => account.address === address ) )
  }

  const initWalletExtension = async () => {     
    const { web3AccountsSubscribe, web3Enable } = await import( "@polkadot/extension-dapp" );

    if (!allowExtensionConnection) {
      return setAccounts([])
    }

    // let unsubscribePromise = Promise.resolve<SubscriptionFn>( () => {} )

    if ( typeof window !== "undefined" ) {
      const unsubscribePromise = web3Enable(process.env.REACT_APP_APPLICATION_NAME ?? 'Talisman').then(() =>
        web3AccountsSubscribe(accounts => {
          console.log( 'accounts', accounts)
          setAccounts( accounts )
          setActingAccountIdx( 0 )
        })
      )
    }

    // return () => {
    //   unsubscribePromise.then(unsubscribe => unsubscribe())
    // }

    // if (typeof window !== "undefined" ) {
    //   const installedWallets = getWallets().filter(wallet => wallet.installed)
    //   console.log( 'installedWallets', installedWallets )
    //   const firstWallet = installedWallets[0]
    //   console.log( 'firstWallet', firstWallet )

    //   // enable the wallet
    //   if (firstWallet) {
    //     try {
    //       await firstWallet?.enable( "Polkadot Tokengated Demo" )
    //       await firstWallet?.subscribeAccounts((allAccounts: WalletAccount[] | undefined) => {
    //           console.log("got accounts via talisman connect", allAccounts)
    //           if ( accounts === undefined || accounts.length === 0 ) {
    //             setAccounts( allAccounts )
    //             setActingAccountIdx( 0 )
    //           }
    //       });
    //     } catch (error) {
    //       console.log( error )
    //     } 
    //     setIsInitialized( true )
    //   }
    // }
  }

  useEffect(() => {
    if ( typeof window !== "undefined" ) {
      const getInjector = async() => {
        const { web3FromSource } = await import( "@polkadot/extension-dapp" );
        const actingAccount = actingAccountIdx !== undefined ? accounts[actingAccountIdx] : undefined
        if ( actingAccount?.meta.source ) {
          const injector = await web3FromSource(actingAccount?.meta.source);
          setInjector( injector )
        }
      }

      getInjector()
    }
  }, [actingAccountIdx, accounts] )

  useEffect(() => {
    initWalletExtension()
  }, [allowExtensionConnection, setAccounts])

  useEffect(() => {
    console.log( Object.keys((globalThis as InjectedWindow).injectedWeb3 ).length > 0 )
    if ( Object.keys((globalThis as InjectedWindow).injectedWeb3 ).length > 0 ) {
      setAllowExtensionConnection(true)
    }
  },[])

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