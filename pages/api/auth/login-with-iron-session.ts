import { withIronSessionApiRoute } from 'iron-session/next';
import { ironOptions } from '../../../lib/iron-config';
import { NextApiRequest, NextApiResponse } from 'next';
import { IronSessionData } from 'iron-session';
import { signatureVerify } from '@polkadot/util-crypto';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { encodeAddress } from '@polkadot/keyring';
import { BN, BN_ZERO } from '@polkadot/util';
import { User } from 'next-auth';

declare module 'iron-session' {
  interface IronSessionData {
    ok?: boolean;
    user?: User;
    error?: any;
  }
}

export default withIronSessionApiRoute(loginRoute, ironOptions);

async function loginRoute(req: NextApiRequest, res: NextApiResponse<IronSessionData>) {
  const credentials = req.body;
  let user: User = { id: '', ksmAddress: '', freeBalance: BN_ZERO };
  console.log('the passed credentials are', credentials);

  if (credentials === undefined) {
    return res.send({ error: '🚫 You shall not pass!' });
  }
  try {
    const message = JSON.parse(credentials.message);
    console.log('the message is', message, process.env.NEXTAUTH_URL, message.uri);

    //verify the message is from the same domain
    if (message.uri !== process.env.NEXTAUTH_URL) {
      return res.send({ error: '🚫 You shall not pass!' });
    }

    // verify signature of the message
    // highlight-start
    const { isValid } = signatureVerify(
      credentials.message,
      credentials.signature,
      credentials.address,
    );
    // highlight-end

    if (!isValid) {
      return res.send({ error: '🚫 Invalid Signature' });
    }

    // verify the account has the defined token
    const wsProvider = new WsProvider(process.env.RPC_ENDPOINT ?? 'wss://kusama-rpc.dwellir.com');
    const api = await ApiPromise.create({ provider: wsProvider });
    await api.isReady;

    if (credentials?.address) {
      const ksmAddress = encodeAddress(credentials.address, 2);
      // highlight-start
      const accountInfo = await api.query.system.account(ksmAddress);

      if (accountInfo.data.free.gt(new BN(1_000_000_000_000))) {
        // if the user has a free balance > 1 KSM, we let them in
        user = {
          id: credentials.address,
          name: credentials.name,
          freeBalance: accountInfo.data.free,
          ksmAddress,
        };
        req.session.user = user;
        await req.session.save();
        return res.send({ ok: true, user });
      } else {
        return res.send({ error: '🚫 The gate is closed for you' });
      }
      // highlight-end
    }

    return res.send({ error: '🚫 API Error' });
  } catch (e) {
    return null;
  }
}
