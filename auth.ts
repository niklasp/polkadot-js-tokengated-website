import { BN, stringToU8a, hexToU8a } from '@polkadot/util';
import { User } from 'next-auth';
import { signatureVerify, sr25519Verify, cryptoWaitReady } from '@polkadot/util-crypto';
import { encodeAddress, decodeAddress } from '@polkadot/keyring';
import NextAuth, { type DefaultSession } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { JWT } from 'next-auth/jwt';
import { WsProvider } from '@polkadot/api';
import { ApiPromise } from '@polkadot/api';
// Initialize crypto module
// This needs to be done once when the server starts
cryptoWaitReady().catch(console.error);

declare module 'next-auth' {
  interface User {
    /** The user's wallet ss58 address */
    address: string;
    /** The user's wallet name */
    name: string;
    /** The user's wallet kusama address */
    ksmAddress: string;
    /** The user's wallet free balance */
    freeBalance: string;
  }

  interface Session {
    user: {
      address: string;
      name: string;
      ksmAddress: string;
      freeBalance: string;
      csrfToken: string;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    /** The user's wallet ss58 address */
    address: string;
    /** The user's wallet kusama address */
    ksmAddress: string;
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
        if (!credentials) return null;

        try {
          // First, ensure WASM crypto is ready
          await cryptoWaitReady();

          const message = credentials.message;
          const messageU8a = stringToU8a(message);

          // Standard verification
          const verifyResult = signatureVerify(
            messageU8a,
            credentials.signature,
            credentials.address,
          );

          if (!verifyResult.isValid) {
            return Promise.reject(new Error('🚫 Invalid Signature'));
          }

          // verify the account has the defined token

          if (credentials?.address) {
            const ksmAddress = encodeAddress(credentials.address, 2);

            const wsProvider = new WsProvider(
              process.env.RPC_ENDPOINT ?? 'wss://kusama-rpc.dwellir.com',
            );
            const api = await ApiPromise.create({ provider: wsProvider });
            await api.isReady;

            const accountInfo = await api.query.system.account(ksmAddress);

            if (accountInfo.data.free.gt(new BN(1_000_000_000_000))) {
              // if the user has a free balance > 1 KSM, we let them in
              return {
                id: credentials.address,
                address: credentials.address,
                name: credentials.name,
                freeBalance: accountInfo.data.free.toString(),
                ksmAddress,
              };
            } else {
              return Promise.reject(new Error('🚫 The gate is closed for you'));
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
        token.ksmAddress = user.ksmAddress;
        token.freeBalance = user.freeBalance;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.address = token.address as string;
        session.user.ksmAddress = token.ksmAddress as string;
        session.user.freeBalance = token.freeBalance as string;
      }
      return session;
    },
  },

  pages: {
    signIn: '/',
  },
});
