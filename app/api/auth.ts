import { getToken } from "next-auth/jwt"

import type { NextApiRequest, NextApiResponse } from "next"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // If you don't have the NEXTAUTH_SECRET environment variable set,
  // you will have to pass your secret as `secret` to `getToken`
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  console.log( 'token', token)
  if (token) {
    // Signed in
    console.log("JSON Web Token", JSON.stringify(token, null, 2))
    res.send(JSON.stringify(token, null, 2))
  } else {
    // Not Signed in
    res.status(401)
  }
  res.end()
}