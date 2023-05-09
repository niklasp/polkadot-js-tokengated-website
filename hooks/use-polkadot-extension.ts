import {
  InjectedAccountWithMeta,
  InjectedExtension,
} from "@polkadot/extension-inject/types";
import { useEffect, useState } from "react";
import { useIsMounted } from "./use-is-mounted";
import { documentReadyPromise } from "./utils";

interface checkEnabledReturnType {
  accounts: InjectedAccountWithMeta[] | null;
  error: Error | null;
}

export const extensionSetup = async () => {
  const extensionDapp = await import("@polkadot/extension-dapp");
  const { web3Accounts, web3Enable, web3AccountsSubscribe } = extensionDapp;
  const enabledApps = await web3Enable("polkadot-extension");
  console.log("enabled Apps", enabledApps);
  if (enabledApps.length === 0) {
    console.log("no extension");
    return;
  }
};

export const checkEnabled: (
  extensionName: string
) => Promise<checkEnabledReturnType> = async (
  extensionName: string = "polkadot-extension"
) => {
  const extensionDapp = await import("@polkadot/extension-dapp");
  const { web3Accounts, web3Enable } = extensionDapp;
  try {
    const enabledApps = await web3Enable(extensionName);
    console.log("enabled Apps", enabledApps);
    const w3Enabled = enabledApps.length > 0;
    let accounts = null;

    if (w3Enabled) {
      accounts = await web3Accounts();
      console.log("accounts", accounts);
      return { accounts, error: null };
    }

    return {
      accounts: null,
      error: new Error(
        "please allow your extension to access this dApp and refresh the page or install a substrate wallet"
      ),
    };
  } catch (error: any) {
    return { accounts: null, error };
  }
};

export interface UsePolkadotExtensionReturnType {
  isReady: boolean;
  accounts: InjectedAccountWithMeta[] | null;
  error: Error | null;
  injector: InjectedExtension | null;
  actingAccount: InjectedAccountWithMeta | null;
  setActingAccountIdx: (idx: number) => void;
}

export const usePolkadotExtension = (): UsePolkadotExtensionReturnType => {
  const isMounted = useIsMounted();
  const [isReady, setIsReady] = useState(false);
  const [accounts, setAccounts] = useState<InjectedAccountWithMeta[] | null>(
    null
  );
  const [extensions, setExtensions] = useState<InjectedExtension[] | null>(
    null
  );
  const [actingAccountIdx, setActingAccountIdx] = useState<number>(0);
  const [error, setError] = useState<Error | null>(null);
  const [injector, setInjector] = useState<InjectedExtension | null>(null);

  const actingAccount = accounts && accounts[actingAccountIdx];

  useEffect(() => {
    const setup = async () => {
      const extensionDapp = await import("@polkadot/extension-dapp");
      const { web3AccountsSubscribe, web3Enable, web3Accounts } = extensionDapp;
      // const enabledApps = await web3Enable("polkadot-extension");

      const injectedPromise = documentReadyPromise(() =>
        web3Enable("polkadot-extension")
      );
      // const injectedPromise = await web3Enable("polkadot-extension");
      const extensions = await injectedPromise;

      setExtensions(extensions);

      if (extensions.length === 0) {
        console.log("no extension");
        return;
      }

      // const accounts = await web3Accounts();

      if (accounts) {
        setIsReady(true);
      } else {
        let unsubscribe: () => void;

        // we subscribe to any account change
        // note that `web3AccountsSubscribe` returns the function to unsubscribe
        unsubscribe = await web3AccountsSubscribe((injectedAccounts) => {
          setAccounts(injectedAccounts);
        });

        return () => unsubscribe && unsubscribe();
      }
    };

    if (!isReady) {
      setup();
    }
  }, [extensions, isReady]);

  useEffect(() => {
    const getInjector = async () => {
      const { web3FromSource } = await import("@polkadot/extension-dapp");
      const actingAccount =
        accounts && actingAccountIdx !== undefined
          ? accounts[actingAccountIdx]
          : undefined;
      if (actingAccount?.meta.source) {
        try {
          const injector = await web3FromSource(actingAccount?.meta.source);
          setInjector(injector);
        } catch (e: any) {
          setError(e);
        }
      }
    };

    getInjector();
  }, [actingAccountIdx, accounts]);

  return {
    accounts,
    actingAccount,
    setActingAccountIdx,
    isReady,
    error,
    injector,
  };
};
