'use client';

import { useState } from 'react';

import { useSession, signIn, signOut, getCsrfToken } from 'next-auth/react';

import styles from '@/styles/Home.module.css';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { WalletSelect } from '@/components/wallet-select';
import { usePolkadotExtension } from '@/providers/polkadot-extension-provider';
import { Binary } from 'polkadot-api';
const inter = Inter({ subsets: ['latin'] });

export default function LoginButton() {
  const router = useRouter();
  const [error, setError] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  const { accounts, activeSigner, initiateConnection, selectedAccount } = usePolkadotExtension();
  // we can use web3FromSource which will return an InjectedExtension type

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      const message = {
        statement: 'Sign in with polkadot extension to the example tokengated example dApp',
        uri: window.location.origin,
        version: '1',
        nonce: await getCsrfToken(),
      };

      const signature = await activeSigner?.signBytes(
        Binary.fromText(JSON.stringify(message)).asBytes(),
      );

      if (!signature) {
        throw new Error('No signature');
      }

      // will return a promise https://next-auth.js.org/getting-started/client#using-the-redirect-false-option
      const result = await signIn('credentials', {
        redirect: false,
        message: JSON.stringify(message),
        name: selectedAccount?.name,
        signature: Binary.fromBytes(signature).asHex(),
        address: selectedAccount?.address,
        redirectTo: '/protected',
      });

      // take the user to the protected page if they are allowed
      if (result?.url) {
        router.push('/protected');
      }

      setError(result?.error ?? '');
      setIsLoading(false);
    } catch (error) {
      setError('Cancelled Signature');
      setIsLoading(false);
    }
  };

  const { data: session } = useSession();

  return (
    <>
      {accounts && accounts.length > 0 ? (
        <>
          <div className={styles.cardWrap}>
            <div className={styles.dropDownWrap}>{!session && <WalletSelect />}</div>
            {session ? (
              <>
                <Link href="/protected" className={styles.card}>
                  <h2 className={inter.className}>
                    🎉 View Tokengated Route <span>-&gt;</span>
                  </h2>
                  <p className={inter.className}>
                    You passed the tokengate {session.user?.name}. You can now view the protected
                    route.
                  </p>
                </Link>
                <div role="button" onClick={() => signOut()} className={styles.card}>
                  <h2 className={inter.className}>
                    Sign Out <span>-&gt;</span>
                  </h2>
                  <p className={inter.className}>
                    Click here to sign out your account {session.user?.name}.
                  </p>
                </div>
              </>
            ) : (
              <div role="button" onClick={() => handleLogin()} className={styles.card}>
                <h2 className={inter.className}>
                  🔑 Let me in <span>-&gt;</span>
                </h2>
                <p className={inter.className}>
                  Click here to sign in with your selected account and check if you can view the
                  tokengated content. <br></br>
                  <span className="text-pink-600 font-bold">You need &gt; 1 DOT free balance.</span>
                </p>
              </div>
            )}
          </div>
          {isLoading ? <>Signing In ...</> : <span className={styles.error}> {error} </span>}
        </>
      ) : (
        <div className={styles.walletInfo}>
          <p>
            Please{' '}
            <a className={styles.colorA} href="https://polkadot.js.org/extension/">
              install a polkadot wallet browser extension
            </a>{' '}
            to test this dApp.
          </p>
          <p>If you have already installed it allow this application to access it.</p>
        </div>
      )}
    </>
  );
}
