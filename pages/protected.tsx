import { getServerSession } from "next-auth/next"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { authOptions } from "./api/auth/[...nextauth]"
import { BN, formatBalance, BN_ZERO } from '@polkadot/util';
import { GetServerSideProps } from 'next'

import styles from '@/styles/Home.module.css'
import PolkadotParticles from "@/components/polkadot-particles"

export default function Admin( { freeBalance } : { freeBalance : BN } ) : JSX.Element {
  const { data:session, status } = useSession({
    required: true,
    onUnauthenticated() {
      console.log( 'not authenticated yet', status )
    },
  })

  if (status === "loading") {
    return (
      <main className={ styles.protected }>
        <h1>You did not pass the 🚪</h1>
        <p><Link href="/" className={ styles.colorA }>&lt; go back</Link></p>
      </main>
    )
  }

  // format the big number to a human readable format
  const ksmBalance = formatBalance( freeBalance, { decimals: 12, withSi: true, withUnit: 'KSM' } )
  
  return (
    <main className={ styles.protected }>
      <h1>🎉 Welcome { session.user?.name }, you passed the 🚪</h1>
      <p>with { ksmBalance }</p>
      <p>You are seeing a /protected route that uses Server-Side Generation at <code>/pages/protected.tsx</code> </p>
      <p><Link href="/" className={ styles.colorA }>&lt; go back</Link></p>
      <PolkadotParticles />
    </main>
  )
}

// this tells next to render the page on the server side
export const getServerSideProps: GetServerSideProps = async (context) => {
  
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
      freeBalance: session?.freeBalance ?? JSON.stringify(BN_ZERO),
    }
  }
}
