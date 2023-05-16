import { useState } from 'react';
import { useSession, signIn, signOut, getCsrfToken } from 'next-auth/react';
import AccountSelect from './account-select';

import { useRouter } from 'next/router';

import styles from '@/styles/Home.module.css';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import { usePolkadotExtensionWithContext } from '@/context/polkadotExtensionContext';
const inter = Inter({ subsets: ['latin'] });

export default function LoginButton() {
  const router = useRouter();
  const [error, setError] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const { accounts, actingAccount, injector } = usePolkadotExtensionWithContext();
  // we can use web3FromSource which will return an InjectedExtension type

  const handleLogin = async () => {
    // TODO 3: write a function that signs a message you create with the injector
    // and calls next-auth signIn
  };

  const { data: session } = useSession();

  // TODO 2: write a login component that lets the user sign something when the
  // session is not set and lets the user logout otherwise
  return <>TODO</>;
}
