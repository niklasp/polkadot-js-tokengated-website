import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { SessionProvider } from "next-auth/react"
import { PolkadotExtensionProvider } from '@/context/polkadotExtensionContext'
import { Analytics } from '@vercel/analytics/react'

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
        <Analytics />
      </PolkadotExtensionProvider>
    </SessionProvider>
  )
}
