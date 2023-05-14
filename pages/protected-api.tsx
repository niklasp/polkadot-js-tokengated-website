import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import styles from '@/styles/Home.module.css';
import Link from 'next/link';
import { formatBalance } from '@polkadot/util';

import PolkadotParticles from '@/components/polkadot-particles';

/**
 * This is a protected page, it can only be accessed by authenticated users. Instead of using Server Side
 * Rendering (SSR) to fetch the content, we use Static Generation and a protected API Route `/pages/api/auth.ts`
 * to fetch the content client side after the user has logged in.
 */
export default function ProtectedPage() {
  const { data: session } = useSession();
  const [content, setContent] = useState();

  // Fetch content from protected route
  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch('/api/auth/login-with-iron-session');

      if (res.ok) {
        const json = await res.json();
        if (json?.content) {
          setContent(json.content);
        }
      }
    };
    fetchData();
  }, [session]);

  // If no session exists, display access denied message
  if (!session) {
    return (
      <main className={styles.protected}>
        <h1>You did not pass the 🚪</h1>
        <p>
          <Link href="/" className={styles.colorA}>
            &lt; go back
          </Link>
        </p>
      </main>
    );
  }

  // format the big number to a human readable format
  const ksmBalance = formatBalance(session.freeBalance, {
    decimals: 12,
    withSi: true,
    withUnit: 'KSM',
  });

  // If session exists, display content
  return (
    <main className={styles.protected}>
      <h1>🎉 Welcome {session.user?.name}, you passed the 🚪</h1>
      <p>with {ksmBalance}</p>
      <p>
        You are seeing a protected route that uses a static page and a protected api route. See the
        code at <code>/pages/protected.tsx</code>
      </p>
      <p>
        {' '}
        <Link href="/" className={styles.colorA}>
          &lt; go back
        </Link>
      </p>
      <PolkadotParticles />
    </main>
  );
}
