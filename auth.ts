import { BN, stringToU8a, hexToU8a } from '@polkadot/util';
import { signatureVerify, sr25519Verify, cryptoWaitReady } from '@polkadot/util-crypto';
import { encodeAddress, decodeAddress } from '@polkadot/keyring';
import NextAuth, { NextAuthOptions } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

// Initialize crypto module
// This needs to be done once when the server starts
cryptoWaitReady().catch(console.error);

// Define types
interface Session {
  address: string | undefined;
  ksmAddress: string;
  freeBalance: BN;
}

interface User {
  id: string;
  name?: string;
  ksmAddress: string;
  freeBalance: BN;
}

export const { auth, handlers } = NextAuth({
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
          console.log('Received auth data:', {
            message: credentials.message,
            signature: credentials.signature,
            address: credentials.address,
          });

          // First, ensure WASM crypto is ready
          await cryptoWaitReady();

          const message = credentials.message;
          const messageU8a = stringToU8a(message);

          // Signature formatting
          const signatureToUse = credentials.signature.startsWith('0x')
            ? credentials.signature
            : `0x${credentials.signature}`;

          console.log('Verifying with:', {
            messageBytes: messageU8a,
            signatureLength: signatureToUse.length,
          });

          // Standard verification
          const verifyResult = signatureVerify(messageU8a, signatureToUse, credentials.address);

          console.log('Standard verification result:', verifyResult);

          // Also try direct sr25519 verification as fallback
          const publicKey = decodeAddress(credentials.address);
          const sigBytes = hexToU8a(signatureToUse);

          try {
            const isValidSr25519 = sr25519Verify(messageU8a, sigBytes, publicKey);
            console.log('Direct sr25519 verification:', isValidSr25519);

            // Use either verification method
            if (!verifyResult.isValid && !isValidSr25519) {
              return Promise.reject(new Error('🚫 Invalid Signature'));
            }
          } catch (cryptoError) {
            console.error('Crypto verification error:', cryptoError);
            // Fall back to just the standard verification result
            if (!verifyResult.isValid) {
              return Promise.reject(new Error('🚫 Invalid Signature'));
            }
          }

          console.log('✅ Signature verified successfully!');

          // Get Kusama address
          const ksmAddress = encodeAddress(credentials.address, 2);

          console.log('Kusama address:', ksmAddress);

          // Return simplified user object
          return {
            id: credentials.address,
            name: credentials.name,
            ksmAddress,
            freeBalance: new BN(1), // Dummy value
          };
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

      session.freeBalance = token.freeBalance as BN;

      return session;
    },
  },

  pages: {
    signIn: '/',
  },
});

export { auth as middleware };

export const config = {
  matcher: ['/protected/:path*'],
};
