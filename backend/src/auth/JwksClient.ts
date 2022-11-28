import { axios } from './utils'
import { createLogger } from '../utils/logger'
import { JwksKey } from './JwksKey'
import { SigningKey } from './SigningKey'
const logger = createLogger('jwksClient')

let jwks: JwksKey[] = null

const certToPEM = (cert: string): string => {
  let pem = cert.match(/.{1,64}/g).join('\n')
  pem = `-----BEGIN CERTIFICATE-----\n${pem}\n-----END CERTIFICATE-----\n`
  return pem
}

const fetchJwks = (url: string): void => {
  const options = {
    method: 'GET',
    url: url
  };

  if (!jwks) {
    axios
      .request(options)
      .then((res) => {
        if (res.status < 200 || res.status >= 300) {
          logger.error(`Http Error ${res.status}`)
        }
        jwks = res.data.keys
      })
      .catch((err) => {
        logger.error('getCert function error: ', err)
      })
  }
}

const getSigningKeys = (): SigningKey[] => {
  if (jwks) {
    const signingKeys: SigningKey[] = jwks
      .filter(
        (key) =>
          key.use === 'sig' &&
          key.kty == 'RSA' &&
          key.kid &&
          ((key.x5c && key.x5c.length) || (key.n && key.e))
      )
      .map((key) => ({ kid: key.kid, publicKey: certToPEM(key.x5c[0]) }))

    if (!signingKeys.length) {
      logger.error(
        'The JWKS endpoint did not contain any signature verification keys'
      )
      return null
    }

    return signingKeys
  }
}

const getSigningKey = (kid: string) => {
  return getSigningKeys().find((key) => key.kid === kid).publicKey
}

export { fetchJwks, getSigningKey }
