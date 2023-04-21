import { createContext, useEffect, useState } from "react";
import type { InjectedAccountWithMeta, InjectedExtension, InjectedWindow } from "@polkadot/extension-inject/types";
import { isDeepStrictEqual } from "util";
// import { web3Accounts, web3Enable, web3FromAddress, web3AccountsSubscribe, web3EnablePromise, isWeb3Injected } from "@polkadot/extension-dapp";
import { getWallets, isWalletInstalled } from "@talismn/connect-wallets";

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
  const [ initialized, setInitialized ] = useState<boolean>( false )
  const [accounts, setAccounts] = useState<InjectedAccountWithMeta[]>([]);
  const [actingAccountIdx, setActingAccountIdx] = useState<number>(0);
  const [isWeb3Injected, setIsWeb3Injected] = useState<boolean>(false);
  const [injector, setInjector] = useState<InjectedExtension>();

    const setActingAccountByAddress = (address: string) => {
      setActingAccountIdx( accounts?.findIndex( account => account.address === address ) )
    }

    const Accounts = async () => {      
      // const { web3Accounts, web3Enable, web3FromAddress, web3AccountsSubscribe, web3EnablePromise, isWeb3Injected, } = await import(
      //   "@polkadot/extension-dapp"
      // );

      // setIsWeb3Injected( isWeb3Injected )
      // // returns an array of all the injected sources
      // // (this needs to be called first, before other requests)
      
      if (typeof window !== "undefined" ) {
        const installedWallets = getWallets().filter(wallet => wallet.installed)
        const firstWallet = installedWallets[0]
        
        // enable the wallet
        if (firstWallet) {
          try {
            await firstWallet.enable( "nextjs connect" )
            if ( ! isWeb3Injected ) {
              const unsubscribe = await firstWallet.subscribeAccounts((allAccounts: WalletAccount[]) => {
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

      // if (typeof window !== "undefined") {
      //   const { web3Accounts, web3Enable, web3FromAddress, web3AccountsSubscribe, web3EnablePromise, isWeb3Injected, } = await import(
      //     "@polkadot/extension-dapp"
      //   );
      //   const wallets = await web3Enable('nextjs connect');
      //   const unsubscribe = await web3AccountsSubscribe((accounts: InjectedAccountWithMeta[]) => {
      //     setAccounts(accounts)
      //     console.log("got accounts via polkadot extension", accounts)
      //   })
      //   console.log("got accounts via polkadot extension", accounts)
        // const installedWallets = getWallets().filter(wallet => wallet.installed)
        // const firstWallet = installedWallets[0]
        
        // // enable the wallet
        // if (firstWallet) {
        //   try {
        //     await firstWallet.enable( "next js connect" )
        //     const unsubscribe = await firstWallet.subscribeAccounts((accounts: WalletAccount[]) => {
        //         console.log("got accounts via talisman connect", accounts)
        //     });
        //   } catch (error) {
        //     console.log( error )
        //   } 
        // } 
      // } 

      // if (typeof window !== "undefined") {
      //   const installedWallets = getWallets().filter(wallet => wallet.installed)
      //   console.log( 'installedWallets', installedWallets )
      //   // get talisman from the array of installed wallets
      //   const firstWallet = installedWallets.find(wallet => wallet.extensionName === 'polkadot-js')
        
      //   // enable the wallet
      //   if (firstWallet) {
      //     firstWallet.enable("nextjs connect").then(() => {
      //       firstWallet.subscribeAccounts((accounts) => {
      //         // do anything you want with the accounts provided by the wallet
      //         console.log("got accounts via polkadot extension", accounts)
      //       })
      //     })
      //   }
      // }

      // const allAccounts = await web3Accounts()

      // if ( ! isEqual ( accounts, allAccounts ) ) {
      //   setAccounts( allAccounts )
      // }

      // // we can use web3FromSource which will return an InjectedExtension type
      // if ( allAccounts.length > 0 ) {      
      //   // finds an injector for an address
      //   const injector = await web3FromAddress(allAccounts[0].address);
      //   setInjector( injector )
      // }
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
            {props.children}
        </PolkadotExtensionContext.Provider>
    )
}