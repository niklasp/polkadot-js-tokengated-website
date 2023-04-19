import { getServerSession } from "next-auth/next"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { authOptions } from "./api/auth/[...nextauth]"
import { BN, formatBalance} from '@polkadot/util'

import styles from '@/styles/Home.module.css'

import PolkadotParticles from "@/components/polkadot-particles"

export default function Admin( { freeBalance } : { freeBalance : BN } ) : JSX.Element {
  const { data:session, status } = useSession({
    required: true,
    onUnauthenticated() {
      console.log( 'not authenticated yet', status )
    },
  })

  // format the big number to a human readable format
  const ksmBalance = formatBalance( freeBalance, { decimals: 12, withSi: true, withUnit: 'KSM' } )

  if (status === "loading") {
    return (
      <main className={ styles.protected }>
        <h1>You did not pass the 🚪</h1>
        <p><Link href="/">&lt; go back</Link></p>
      </main>
    )
  }
  
  return (
    <main className={ styles.protected }>
      <h1>🎉 Welcome, you passed the 🚪</h1>
      <p>with { ksmBalance }</p>
      <PolkadotParticles />
    </main>
  )
}

export async function getServerSideProps(context) {
  
  // Get the user's session based on the request
  // read more about get Server session here:
  // https://next-auth.js.org/tutorials/securing-pages-and-api-routes
  let session = await getServerSession(
    context.req,
    context.res,
    authOptions
  )

  return {
    props: {
      freeBalance: session?.freeBalance ?? 0,
    }
  }
}
