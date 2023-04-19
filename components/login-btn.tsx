  import { useEffect, useState } from "react";
  import type { InjectedAccountWithMeta } from "@polkadot/extension-inject/types";

  import { useSession, signIn, signOut, getCsrfToken } from "next-auth/react"
  import AccountSelect from "./account-select";
  import { usePolkadotExtension } from "@/hooks/usePolkadotExtension";

  import { useRouter } from "next/router";

  import styles from '@/styles/Home.module.css'
  import { Inter } from "next/font/google";
  const inter = Inter({ subsets: ['latin'] })

  export default function LoginButton() {
      // const [{ data: connectData }, connect] = useConnect()
      // const [{ data: accountData }] = useAccount()
      const router = useRouter()
      const [error, setError] = useState<string | undefined>(undefined)
      const [isLoading, setIsLoading] = useState( false )

      const { accounts, onSelectAccount, actingAccount, extensionInstalled, injector } = usePolkadotExtension()

        console.log( accounts, actingAccount, extensionInstalled );

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
      
        const handleLogout = async () => {
          signOut({ redirect: false })
        }
    
      // const handleLogin = async () => {
      //   try {
      //     if (actingAccount?.address) {
      //       signIn('credentials', { address: actingAccount.address })
      //       return
      //     }
      //   } catch (error) {
      //     window.alert(error)
      //   }
      // }

      // const extensionSetup = async () => {
      //     const { web3Accounts, web3Enable } = await import(
      //       "@polkadot/extension-dapp"
      //     );
      //     const extensions = await web3Enable("Tokengated Polkadot");
      //     if (extensions.length === 0) {
      //       return;
      //     }
      //     setExtensionInstalled( true )
      //     const account = await web3Accounts();
      //     setAccounts(account);
      //   };

    const { data: session, status } = useSession()
    
    return (
      <>
        { extensionInstalled ? 
          <>
            { session ?
              <>
                <p>Signed in as { session.address }</p>
                <button onClick={() => signOut()}>Sign out</button>
              </> :
              <>
                <div className={ styles.cardWrap }>
                  <div className={ styles.dropDownWrap }>
                    <AccountSelect accounts={ accounts } onSelectAccount={ onSelectAccount } />
                  </div>
                  <div
                    role="button"
                    onClick={() => handleLogin()}
                    className={styles.card}
                  >
                    <h2 className={inter.className}>
                      🔑 Let me in <span>-&gt;</span>
                    </h2>
                    <p className={inter.className}>
                      Click here to sign in with your selected account and check if you can view the tokengated content.
                    </p>
                  </div>
                </div>          
                { isLoading ? <>Loading ...</> : <> { error } </> }
              </>
            }
          </> :
          <div>
            <a href="https://polkadot.js.org/extension/">Please install a polkadot wallet browser extension to test this dApp</a>
          </div>
        }
        
      </>
    )
  }