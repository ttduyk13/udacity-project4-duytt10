import axios from 'axios'
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

const fetchJwks = async (url: string): Promise<void> => {
  const options = {
    method: 'GET',
    url: url
  };

  let res;

  if (!jwks) {
    logger.info(`request: ${JSON.stringify(options)}`)
    res = await axios.request(options)

    logger.info('response data', res.data)
    jwks = res.data.keys
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

    logger.info(`signing keys: `, signingKeys)

    return signingKeys
  }
}

const getSigningKey = (kid: string) => {
  logger.info(`current kid: ${kid}`)
  return getSigningKeys().find((key) => key.kid === kid).publicKey
}

export { fetchJwks, getSigningKey }
