import { JWT } from 'next-auth/jwt';
import { BN, stringToU8a, hexToU8a } from '@polkadot/util';
import { User } from 'next-auth';
import { signatureVerify, cryptoWaitReady } from '@polkadot/util-crypto';
import { encodeAddress } from '@polkadot/keyring';
import NextAuth, { type DefaultSession } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

import { WsProvider } from '@polkadot/api';
import { ApiPromise } from '@polkadot/api';
import { getAccountBalance } from './app/api/auth/[...nextauth]/get-account-balance';
declare module 'next-auth' {
  interface User {
    /** The user's wallet ss58 address */
    address: string;
    /** The user's wallet name */
    name?: string | null;
    /** The user's wallet free balance */
    freeBalance: string;
  }

  interface Session {
    user: {
      address: string;
      name?: string | null;
      freeBalance: string;
      csrfToken: string;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    /** The user's wallet ss58 address */
    address: string;
    /** The user's wallet free balance */
    freeBalance: string;
    /** The CSRF token used to prevent CSRF attacks (aka nonce) */
    csrfToken: string;
  }
}

export const { auth, handlers } = NextAuth({
  debug: true,
  providers: [
    Credentials({
      credentials: {
        address: { label: 'Address', type: 'text' },
        message: { label: 'Message', type: 'text' },
        signature: { label: 'Signature', type: 'text' },
        csrfToken: { label: 'CSRF Token', type: 'text' },
        name: { label: 'Name', type: 'text' },
      },

      async authorize(credentials): Promise<User | null> {
        if (
          !credentials ||
          typeof credentials.message !== 'string' ||
          typeof credentials.signature !== 'string' ||
          typeof credentials.address !== 'string' ||
          typeof credentials.name !== 'string'
        ) {
          return Promise.reject(new Error('🚫 Invalid credentials'));
        }

        try {
          // First, ensure WASM crypto is ready
          await cryptoWaitReady();

          const message = credentials.message;
          const messageU8a = stringToU8a(message as string);

          // Standard verification
          const verifyResult = signatureVerify(
            messageU8a,
            credentials.signature as string,
            credentials.address as string,
          );

          if (!verifyResult.isValid) {
            return Promise.reject(new Error('🚫 Invalid Signature'));
          }

          // verify the account has the defined token
          if (credentials?.address) {
            const { free, frozen, reserved } = await getAccountBalance(credentials.address);

            const transferable = free - frozen - reserved;

            if (transferable > 1_000_000_000_000) {
              // if the user has a free balance > 1 DOT, we let them in
              return {
                id: credentials.address,
                address: credentials.address,
                name: credentials.name ?? '',
                freeBalance: transferable.toString(),
              };
            } else {
              return Promise.reject(new Error('🚫 You need more DOT, please top up your account'));
            }
          }

          return Promise.reject(new Error('🚫 API Error'));
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.address = user.address;
        token.freeBalance = user.freeBalance;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.address = token.address as string;
        session.user.freeBalance = token.freeBalance as string;
        session.user.name = token.name as string;
      }
      return session;
    },
  },

  pages: {
    signIn: '/',
  },
});
