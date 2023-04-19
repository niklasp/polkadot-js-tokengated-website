  import { useEffect, useState } from "react";
  import type { InjectedAccountWithMeta } from "@polkadot/extension-inject/types";

  import { useSession, signIn, signOut, getCsrfToken } from "next-auth/react"
  import AccountSelect from "./account-select";
  import { usePolkadotExtension } from "@/hooks/usePolkadotExtension";

  import { useRouter } from "next/router";

  import styles from '@/styles/Home.module.css'
  import { Inter } from "next/font/google";
import Identicon from "@polkadot/react-identicon";
import { accountOptionTemplate } from './account-select';
  const inter = Inter({ subsets: ['latin'] })

  export default function LoginButton() {
      const router = useRouter()
      const [error, setError] = useState<string | undefined>(undefined)
      const [isLoading, setIsLoading] = useState( false )

      const { accounts, onSelectAccount, actingAccount, extensionInstalled, injector } = usePolkadotExtension()

      const handleLogin = async () => {
          try {
            setIsLoading( true )
            let signature = ''
            const message = {
              // domain: window.location.host,
              address: actingAccount?.address,
              statement: 'Sign in with polkadot extension to the example tokengated example dApp',
              // uri: window.location.origin,
              version: '1',
              nonce: await getCsrfToken(),
            }

            const signRaw = injector?.signer?.signRaw;

            if (!!signRaw && !!actingAccount) {
                // after making sure that signRaw is defined
                // we can use it to sign our message
                const data = await signRaw({
                  address: actingAccount.address,
                  data: JSON.stringify(message),
                  type: "bytes"
                });

                signature = data.signature
            }

            // will return a promise https://next-auth.js.org/getting-started/client#using-the-redirect-false-option
            const result = await signIn('credentials', {
              redirect: false,
              callbackUrl: '/protected',
              message: JSON.stringify(message),
              name: actingAccount?.meta.name,
              signature,
              address: actingAccount?.address
            })

            setError( result?.error )
            setIsLoading( false )

            // take the user to the protected page if they are allowed
            if(result?.url) {
              router.push("/protected");
            }

          } catch (error) {
            setError( 'error_auth' )
            setIsLoading( false )
          }
        }

    const { data: session, status } = useSession()
    
    return (
      <>
        { extensionInstalled ? 
        <>
          <div className={ styles.cardWrap }>
            <div className={ styles.dropDownWrap }>
              { ! session &&
                <AccountSelect
                  actingAccount={ actingAccount }
                  accounts={ accounts }
                  onSelectAccount={ onSelectAccount }
                /> 
              }
            </div>
            { session ?
              <>
                <a
                  href="/protected"
                  className={styles.card}
                >
                  <h2 className={inter.className}>
                    🎉 You passed the tokengate { session.user?.name }.  <span>-&gt;</span>
                  </h2>
                  <p className={inter.className}>
                    View Tokengated Route
                  </p>
                </a>
                <div
                  role="button"
                  onClick={() => signOut()}
                  className={styles.card}
                >
                  <h2 className={inter.className}>
                    Sign Out { session.user?.name } <span>-&gt;</span>
                  </h2>
                  <p className={inter.className}>
                    Click here to sign out.
                  </p>
                </div>
              </>
                : 
                <div
                  role="button"
                  onClick={() => handleLogin()}
                  className={styles.card}
                >
                  <h2 className={inter.className}>
                    🔑 Let me in <span>-&gt;</span>
                  </h2>
                  <p className={inter.className}>
                    Click here to sign in with your selected account and check if 
                    you can view the tokengated content. <br></br>
                    You need &gt; 1 KSM free balance.
                  </p>
                </div>
              }
            </div>
            { isLoading ? <>Signing In ...</> : <> { error } </> }
          </>
          : 
          <div>
            Please <a className={ styles.colorA } href="https://polkadot.js.org/extension/">install a polkadot wallet browser extension</a> to test this dApp.
            <p>If you have already installed it, allow this application to access it.</p>
          </div>
        }
      </>
    )
  }