import { auth } from '@/auth';
import Link from 'next/link';

import styles from '@/styles/Home.module.css';
import { formatBalance } from '@polkadot/util';
import PolkadotParticles from '@/components/polkadot-particles';

export default async function ProtectedPage() {
  const session = await auth();

  if (!session?.user)
    return (
      <div className={styles.protected}>
        <h1>You did not pass the 🚪</h1>
        <p>
          <Link href="/" className={styles.colorA}>
            &lt; go back
          </Link>
        </p>
      </div>
    );

  return (
    <div className={styles.protected}>
      <h1>🎉 Welcome {session.user.name}, you passed the 🚪</h1>
      <p>Your user details are:</p>
      <pre className={styles.colorA}>{JSON.stringify(session.user, null, 2)}</pre>
      <p>
        Your transferable balance is:{' '}
        <span className={styles.colorA}>
          {formatBalance(session.user.freeBalance, {
            forceUnit: 'DOT',
            withUnit: 'DOT',
            withSi: false,
            decimals: 10,
          })}
        </span>{' '}
        DOT
      </p>
      <p>
        <Link href="/" className={styles.colorA}>
          &lt; go back
        </Link>
      </p>
      <PolkadotParticles />
    </div>
  );
}
