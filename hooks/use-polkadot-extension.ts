import { InjectedAccountWithMeta, InjectedExtension } from '@polkadot/extension-inject/types';
import { useEffect, useState } from 'react';
import { documentReadyPromise } from './utils';

export interface UsePolkadotExtensionReturnType {
  isReady: boolean;
  accounts: InjectedAccountWithMeta[] | null;
  error: Error | null;
  injector: InjectedExtension | null;
  actingAccount: InjectedAccountWithMeta | null;
  setActingAccountIdx: (idx: number) => void;
}

export const usePolkadotExtension = (): UsePolkadotExtensionReturnType => {
  const [isReady, setIsReady] = useState(false);
  const [accounts, setAccounts] = useState<InjectedAccountWithMeta[] | null>(null);
  const [extensions, setExtensions] = useState<InjectedExtension[] | null>(null);
  const [actingAccountIdx, setActingAccountIdx] = useState<number>(0);
  const [error, setError] = useState<Error | null>(null);
  const [injector, setInjector] = useState<InjectedExtension | null>(null);

  const actingAccount = accounts && accounts[actingAccountIdx];

  useEffect(() => {
    // TODO: This effect is used to setup the browser extension
  }, [extensions]);

  useEffect(() => {
    // TODO: This effect is used to get the injector from the selected account
    // and is triggered when the accounts or the actingAccountIdx change
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
