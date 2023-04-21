import Head from 'next/head'
import Image from 'next/image'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'

import LoginButton from '@/components/login'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  return (
    <>
      <Head>
        <title>Polkadot Tokengated Tutorial</title>
        <meta name="description" content="Demo Tutorial dApp using polkadot js api and next auth to build a tokengated website" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1340 1410.3' xml:space='preserve'%3E%3Cellipse fill='%23E6007A' cx='663' cy='147.9' rx='254.3' ry='147.9'/%3E%3Cellipse fill='%23E6007A' cx='663' cy='1262.3' rx='254.3' ry='147.9'/%3E%3Cellipse transform='rotate(-60 180.499 426.56)' fill='%23E6007A' cx='180.5' cy='426.5' rx='254.3' ry='148'/%3E%3Cellipse transform='rotate(-60 1145.575 983.768)' fill='%23E6007A' cx='1145.6' cy='983.7' rx='254.3' ry='147.9'/%3E%3Cellipse transform='rotate(-30 180.45 983.72)' fill='%23E6007A' cx='180.5' cy='983.7' rx='148' ry='254.3'/%3E%3Cellipse transform='rotate(-30 1145.522 426.601)' fill='%23E6007A' cx='1145.6' cy='426.6' rx='147.9' ry='254.3'/%3E%3C/svg%3E" />
      </Head>
      <main className={styles.main}>
        <div className={styles.center}>
          <Image
            className={styles.logo}
            src="/polkadot.svg"
            alt="Polkadot Logo"
            width={240}
            height={77}
            priority
          />
          <p className={inter.className}>Tokengated Tutorial Demo</p>
        </div>
        <LoginButton />

        <div className={styles.description}>
            <a
              href="https://github.com/niklasp/polkadot-js-tokengated-webssite"
              target="_blank"
            >
              <Image
                src="/github.svg"
                alt="Github Repository"
                className={styles.githubLogo}
                width={16}
                height={16}
                priority
              />
              View the repo
            </a>
            <a
              href="#"
            >
              <span>📖 <s>View the tutorial</s>(soon)</span>
            </a>
            <Link
              href="/protected"
              rel="noopener noreferrer"
            >
              🔐 Go to /protected
            </Link>
          </div>
      </main>
    </>
  )
}
