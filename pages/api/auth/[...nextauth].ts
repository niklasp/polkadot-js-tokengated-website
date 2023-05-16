import NextAuth, { NextAuthOptions, User } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { signatureVerify } from '@polkadot/util-crypto';
import { encodeAddress } from '@polkadot/keyring';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { BN } from '@polkadot/util';

declare module 'next-auth' {
  interface Session {
    address: string | undefined;
    ksmAddress: string;
    freeBalance: BN;
  }

  interface User {
    id: string;
    ksmAddress: string;
    freeBalance: BN;
  }

  interface credentials {
    address: string;
    message: string;
    signature: string;
    csrfToken: string;
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
          label: 'Message',
          type: 'text',
          placeholder: '0x0',
        },
        signature: {
          label: 'Signature',
          type: 'text',
          placeholder: '0x0',
        },
        csrfToken: {
          label: 'CSRF Token',
          type: 'text',
          placeholder: '0x0',
        },
        name: {
          label: 'Name',
          type: 'text',
          placeholder: 'name',
        },
      },
      async authorize(credentials): Promise<User | null> {
        //TODO: write an authorize function
        return null;
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    // maxAge: 3, // uncomment to test session expiration in seconds
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.freeBalance = user.freeBalance;
      }
      return token;
    },
    async session(sessionData) {
      const { session, token } = sessionData;

      session.address = token.sub;
      if (session.address) {
        session.ksmAddress = encodeAddress(session.address, 2);
      }

      // as we already queried it, we can add whatever token to the session,
      // so pages can use it without an extra query
      session.freeBalance = token.freeBalance as BN;

      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/',
    signOut: '/',
    error: '/',
    newUser: '/',
  },
};

export default NextAuth(authOptions);
