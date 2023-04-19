import { useEffect, useState } from "react";
import type { InjectedAccountWithMeta, InjectedExtension } from "@polkadot/extension-inject/types";

export function usePolkadotExtension() {
  const [accounts, setAccounts] = useState<InjectedAccountWithMeta[]>([]);
  const [actingAccount, setActingAccount] = useState<InjectedAccountWithMeta>();
  const [extensionInstalled, setExtensionInstalled] = useState(false);
  const [injector, setInjector] = useState<InjectedExtension>()

  useEffect(() => {
    extensionSetup()
  }, [])

  const extensionSetup = async () => {
    const { web3Accounts, web3Enable, web3FromAddress } = await import(
      "@polkadot/extension-dapp"
    );
    const extensions = await web3Enable("Tokengated Polkadot Demo")
    console.log( 'extensions', extensions )
    if (extensions.length === 0) {
      return;
    }
    setExtensionInstalled( true )
    const accounts = await web3Accounts()
    setAccounts(accounts)
    setActingAccount(accounts[0])

    // we can use web3FromSource which will return an InjectedExtension type
    // if ( actingAccount?.address) {
      // the address we use to use for signing, as injected
    
      // finds an injector for an address
      const injector = await web3FromAddress(accounts[0].address);
      setInjector( injector )
    // }
    
  };

  const onSelectAccount = ( address: any ) => {
    console.log( 'onselectaccount', address )
    setActingAccount( accounts?.find( a => a.address === address ) )
  }

  return { accounts, actingAccount, setActingAccount, extensionInstalled, onSelectAccount, injector }
  
}