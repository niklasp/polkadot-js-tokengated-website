import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import { PolkadotExtensionContextProvider } from '@/context/polkadotExtensionContext';

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <PolkadotExtensionContextProvider>
        <Component {...pageProps} />
      </PolkadotExtensionContextProvider>
    </SessionProvider>
  );
}
