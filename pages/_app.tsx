import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { SessionProvider } from "next-auth/react"
import { PolkadotExtensionProvider } from '@/context/polkadotExtensionContext'
import { usePolkadotExtension } from '@/hooks/usePolkadotExtension'

export default function App(
  { 
    Component,
    pageProps: { session, ...pageProps }
  }: AppProps
) {

  return (
    <SessionProvider session={session}>
      <PolkadotExtensionProvider>
        <Component {...pageProps} />
      </PolkadotExtensionProvider>
    </SessionProvider>
  )
}
