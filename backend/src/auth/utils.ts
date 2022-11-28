import { decode } from 'jsonwebtoken'

import { JwtPayload } from './JwtPayload'
import Axios from 'axios'

export function parseUserId(jwtToken: string): string {
  const decodedJwt = decode(jwtToken) as JwtPayload
  return decodedJwt.sub
}

export const axios = Axios
