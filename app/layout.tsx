import { auth } from '@/auth';
import { PolkadotExtensionContextProvider } from '@/context/polkadotExtensionContext';
import { Metadata } from 'next';
import { SessionProvider } from 'next-auth/react';

export default async function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <PolkadotExtensionContextProvider>
        <html>
          <body>{children}</body>
        </html>
      </PolkadotExtensionContextProvider>
    </SessionProvider>
  );
}

export const metadata: Metadata = {
  title: 'Polkadot Tokengated Tutorial',
  description:
    'Demo Tutorial dApp using polkadot js api and next auth to build a tokengated website',
};
