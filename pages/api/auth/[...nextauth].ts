import NextAuth, { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import "@polkadot/api-augment"
import { signatureVerify } from '@polkadot/util-crypto';
import { encodeAddress } from '@polkadot/keyring'
import { ApiPromise, WsProvider } from "@polkadot/api"
import { BN } from '@polkadot/util'

declare module 'next-auth' {
  interface Session {
    address: string | undefined
    ksmAddress: string
    freeBalance: BN
  }

  interface User {
    id: string
    ksmAddress: string
    freeBalance: BN
  }

  interface credentials {
    address: string
    message: string
    signature: string
    csrfToken: string,
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        address: {
          label: 'Address',
          type: 'text',
          placeholder: '0x0',
        },
        message: {
          label: "Message",
          type: "text",
          placeholder: "0x0",
        },
        signature: {
          label: "Signature",
          type: "text",
          placeholder: "0x0",
        },
      },
      async authorize(credentials): Promise<any | null> {
        // console.log( 'authorizing ', credentials )
        if (credentials === undefined) { return null }
        try {
          //fix types for message
          const message = JSON.parse(credentials.message)

          //TODO verify the domain

          //verify the nonce
          if (message.nonce !== credentials.csrfToken ) {
            return Promise.reject(new Error('invalid_csrf'))
          }

          // verify signature of the message
          const { isValid } = signatureVerify(credentials.message, credentials.signature, credentials.address);
          if ( ! isValid ) {
            return Promise.reject(new Error('invalid_signature'))
          }

          // verify the account has the defined token
          const wsProvider = new WsProvider('wss://kusama-rpc.dwellir.com')
          const api = await ApiPromise.create({ provider: wsProvider });
          
          if ( credentials?.address ) {
            const ksmAddress = encodeAddress( credentials.address, 2 )
            const accountInfo = await api.query.system.account( ksmAddress )

            if ( accountInfo.data.free.gt(new BN(1_000_000_000_000)) ) {
              // if the user has a free balance > 1 KSM, we let them in
              return {
                id: credentials.address,
                freeBalance: accountInfo.data.free,
                ksmAddress,
              }
            } else {
              return Promise.reject(new Error('😩 The gate is closed for you'))
            }
          }

          return Promise.reject(new Error('api_error'))
        } catch (e) {
          return null
        }
        // if ( !credentials?.address) {
        //   return null
        // }
        // return {
        //   id: credentials.signature,
        //   address: credentials.address,
        // }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  jwt: {
    secret: "not very secret",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.freeBalance = user.freeBalance
      }
      return token
    },
    async session(sessionData) {
      const { session, token } = sessionData

      session.address = token.sub
      if ( session.address ) {
        session.ksmAddress = encodeAddress( session.address, 2 )
      }

      // as we already queried it, we can add whatever token to the session,
      // so pages can use it without an extra query
      session.freeBalance = token.freeBalance as BN
      
      return session
    },
  },
  secret: "not very secret",
  pages: {
    signIn: '/',
    signOut: '/',
    error: '/',
    newUser: '/',
  },
}


export default NextAuth(authOptions)
