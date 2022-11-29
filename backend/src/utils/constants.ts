const EMPTY_STRING = ''
const DEFAULT_KID = 'rKuedoaou-2EviUcYNkZo'
const JWKS_URI =
  'https://dev-esnd1dc8ioqsa83e.us.auth0.com/.well-known/jwks.json'

const attachmentUrl = (todoId:string, userId:string, bucketName:string) => {
    return `https://${bucketName}.s3.us-east-2.amazonaws.com/${userId}-${todoId}.png`
}

export { EMPTY_STRING, JWKS_URI, DEFAULT_KID, attachmentUrl }
