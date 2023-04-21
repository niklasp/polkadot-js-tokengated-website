import { useContext, useState } from 'react';
import Identicon from '@polkadot/react-identicon';
import 'primereact/resources/themes/md-dark-indigo/theme.css'
import 'primereact/resources/primereact.min.css'    
import { Dropdown } from 'primereact/dropdown'
import styles from '@/styles/Home.module.css'
import { PolkadotExtensionContext } from '@/context/polkadotExtensionContext';

export const accountValueTemplate = (option: any, props: any) => {
    if ( option ) {
    return (
        <div className={ styles.accountOption }>
            <div>
                <Identicon
                    value={option?.address}
                    size={32}
                    theme='polkadot'
                />
                {option?.name }
            </div>
        </div>
    );
    }

    return <span>{props.placeholder}</span>;
};

export const accountOptionTemplate = (option: any) => {
    return (
        <div className={ styles.accountOption }>
            <div>
                <Identicon
                    value={option?.address}
                    size={32}
                    theme='polkadot'
                />
                {option?.name }
            </div>
        </div>
    );
};

export default function AccountSelector( ) {
    const { accounts, actingAccountIdx, setActingAccountIdx, setActingAccountByAddress } = useContext(PolkadotExtensionContext)
    const actingAccount = accounts[actingAccountIdx]

    return (
        <Dropdown 
            options={ accounts }
            optionLabel="address" 
            placeholder="Select Account"
            className={ styles.dropdown }
            value={ actingAccount }
            itemTemplate={ accountOptionTemplate }
            valueTemplate={ accountValueTemplate }
            onChange={(event) => {
                setActingAccountByAddress(event.target.value.address)
            }}
        />
    )
    

    // return (
    //     <>
    //         <label for="select-polkadot-account">
    //             Select the account you want to use
    //         </label>
    //         <select
    //             id="select-polkadot-account"
    //             className="p-3 m-3 border-2 border-green-500"
    //             onChange={(event) => {
    //             console.log(event);
    //             onSelectAccount(event.target.value);
    //             }}
    //         >
    //             {accounts.map((a) => (
    //             <option key={a.address} value={a.address}>
    //                 {a.address} [{a.meta.name}]
    //             </option>
    //             ))}
    //         </select>
    //     </>
    // )
}