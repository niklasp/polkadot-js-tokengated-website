// `dot` is the name we gave to `npx papi add`
import { dot } from '@polkadot-api/descriptors';
import { createClient } from 'polkadot-api';
// import from "polkadot-api/ws-provider/node"
// if you are running in a NodeJS environment
import { getWsProvider } from 'polkadot-api/ws-provider/web';
import { withPolkadotSdkCompat } from 'polkadot-api/polkadot-sdk-compat';

export async function getAccountBalance(address: string) {
  // Connect to the polkadot relay chain.
  const client = createClient(withPolkadotSdkCompat(getWsProvider('wss://dot-rpc.stakeworld.io')));
  const dotApi = client.getTypedApi(dot);

  // get the value for an account
  const {
    data: { free, frozen, reserved },
  } = await dotApi.query.System.Account.getValue(address);

  return { free, frozen, reserved };
}
