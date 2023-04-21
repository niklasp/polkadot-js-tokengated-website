# Polkadot Tokengated Tutorial with next-auth

This is a the demo repo for a tokengated website with polkadot js API and next.js. It allows you to connect your wallet and sign a message. Then the server will check the via the polkadot js api if the signing wallet passes an arbitrary token check. 

A tutorial that explains how it works will be published soon on [polkadot.study](https://polkadot.study)

## Run the Project Locally

First copy the .env.local.example to .env.local

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## More

- The project was funded by the Kusama Treasury in Referendum 102 (within polkadot.study proposal)
- This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).