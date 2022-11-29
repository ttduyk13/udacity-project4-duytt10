/**
 * A payload of a JWT token
 */
export interface SigningKey {
  kid: string
  publicKey: string
}
