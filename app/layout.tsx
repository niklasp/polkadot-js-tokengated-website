import '@/styles/globals.css';
import { Metadata } from 'next';
import { SessionProvider } from 'next-auth/react';
import styles from '@/styles/Home.module.css';
import { PolkadotExtensionProvider } from '@/providers/polkadot-extension-provider';

export default async function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <PolkadotExtensionProvider>
        <html>
          <body>
            <main className={styles.main}>{children}</main>
          </body>
        </html>
      </PolkadotExtensionProvider>
    </SessionProvider>
  );
}

export const metadata: Metadata = {
  title: 'Polkadot Tokengated Tutorial',
  description:
    'Demo Tutorial dApp using polkadot js api and next auth to build a tokengated website',
};
