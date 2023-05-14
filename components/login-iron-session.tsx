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
  const [session, setSession] = useState(null);

  const { accounts, actingAccount, injector } = usePolkadotExtensionWithContext();
  // we can use web3FromSource which will return an InjectedExtension type

  const signIn = async (credentials: any) => {
    const options: RequestInit = {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    };

    const response = fetch('/api/auth/login-with-iron-session', options);
    const jsonData = (await response).json();

    return jsonData;
  };

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      let signature = '';
      const message = {
        domain: window.location.host,
        address: actingAccount?.address,
        statement: 'Sign in with polkadot extension to the example tokengated example dApp',
        uri: window.location.origin,
        version: '1',
        nonce: await getCsrfToken(),
      };

      const signRaw = injector?.signer?.signRaw;

      if (!!signRaw && !!actingAccount) {
        // after making sure that signRaw is defined
        // we can use it to sign our message
        const data = await signRaw({
          address: actingAccount.address,
          data: JSON.stringify(message),
          type: 'bytes',
        });

        signature = data.signature;
      }

      const result = await signIn({
        redirect: false,
        callbackUrl: '/protected-api',
        message: JSON.stringify(message),
        name: actingAccount?.meta?.name,
        signature,
        address: actingAccount?.address,
      });

      // take the user to the protected page if they are allowed
      if (result?.user) {
        router.push('/protected-api');
      }

      setError(result?.error);
      setIsLoading(false);
    } catch (error) {
      setError('Cancelled Signature');
      setIsLoading(false);
    }
  };

  return (
    <>
      {accounts && accounts.length > 0 ? (
        <>
          <div className={styles.cardWrap}>
            <div className={styles.dropDownWrap}>{!session && <AccountSelect />}</div>
            {session ? (
              <>
                <Link href="/protected-api" className={styles.card}>
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
                  You need &gt; 1 KSM free balance.
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
