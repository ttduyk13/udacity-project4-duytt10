import * as AWS from 'aws-sdk'
import { S3 } from 'aws-sdk'

export class S3Storage {
  constructor(
    private readonly s3: S3 = new AWS.S3({ signatureVersion: 'v4' }),
    private readonly bucketName = process.env.ATTACHMENT_S3_BUCKET,
    private readonly urlExpiration = process.env.SIGNED_URL_EXPIRATION
  ) {}

  private defaultUrlExpiration: number = 300

  getUploadUrl = (todoId: string, userId: string): string => {
    const params = {
      Bucket: this.bucketName,
      Key: `${userId}-${todoId}`,
      Expires: Number.isInteger(this.urlExpiration)
        ? parseInt(this.urlExpiration)
        : this.defaultUrlExpiration
    }
    return this.s3.getSignedUrl('putObject', params)
  }
}
