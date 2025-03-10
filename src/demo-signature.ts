import { signatureVerify, cryptoWaitReady } from '@polkadot/util-crypto';
import { Keyring } from '@polkadot/keyring';
import { stringToU8a, u8aToHex } from '@polkadot/util';

async function demoSignature() {
  // Wait for crypto to be initialized
  await cryptoWaitReady();

  // Create a keyring and test account
  const keyring = new Keyring({ type: 'sr25519' });
  const testAccount = keyring.addFromUri('//Alice');

  // Create and sign a message
  const message = {
    statement: 'Sign in with polkadot extension to the example tokengated example dApp',
    uri: 'http://localhost:3000',
    version: '1',
    nonce: 123456,
  };
  const messageU8a = stringToU8a(JSON.stringify(message));

  const signature = testAccount.sign(messageU8a);
  const signatureHex = u8aToHex(signature);

  // Verify the signature
  const result = signatureVerify(messageU8a, signatureHex, testAccount.address);

  // Show the results
  console.log({
    address: testAccount.address,
    publicKey: u8aToHex(testAccount.publicKey),
    message,
    signature: signatureHex,
    isValid: result.isValid,
    // Show different address formats
    addresses: {
      polkadot: keyring.encodeAddress(testAccount.publicKey, 0),
      kusama: keyring.encodeAddress(testAccount.publicKey, 2),
      substrate: keyring.encodeAddress(testAccount.publicKey, 42),
    },
  });
}

// Run the demo
demoSignature().catch(console.error);
