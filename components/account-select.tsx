import { useState } from 'react';
import Identicon from '@polkadot/react-identicon';
import { usePolkadotExtensionWithContext } from '@/context/polkadotExtensionContext';

import 'primereact/resources/themes/md-dark-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import { Dropdown } from 'primereact/dropdown';
import styles from '@/styles/Home.module.css';

export const accountValueTemplate = (option: any, props: any) => {
  if (option) {
    return (
      <div className={styles.accountOption}>
        <div>
          <Identicon value={option?.address} size={32} theme="polkadot" />
          {option?.meta?.name}
        </div>
      </div>
    );
  }

  return <span>{props.placeholder}</span>;
};

export const accountOptionTemplate = (option: any) => {
  return (
    <div className={styles.accountOption}>
      <div>
        <Identicon value={option?.address} size={32} theme="polkadot" />
        {option?.meta?.name}
      </div>
    </div>
  );
};

export default function AccountSelector() {
  const { accounts, actingAccount, setActingAccountIdx } = usePolkadotExtensionWithContext();

  return (
    <Dropdown
      options={accounts ?? undefined}
      optionLabel="address"
      placeholder="Select Account"
      className={styles.dropdown}
      value={actingAccount}
      itemTemplate={accountOptionTemplate}
      valueTemplate={accountValueTemplate}
      onChange={(event) => {
        const accountIdx = accounts
          ? accounts.findIndex((account) => account.address === event.target.value.address)
          : 0;
        setActingAccountIdx(accountIdx);
      }}
    />
  );
}
