import { useState } from 'react';
import { usePolkadotExtensionWithContext } from '@/context/polkadotExtensionContext';
import styles from '@/styles/Home.module.css';

export default function AccountSelector() {
  const { accounts, actingAccount, setActingAccountIdx } = usePolkadotExtensionWithContext();
  // TODO 1 write an account selector that lets the user select an account
  return <>Todo</>;
}
