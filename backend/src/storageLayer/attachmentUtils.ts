import * as AWS from 'aws-sdk'
import {AWSError, S3} from 'aws-sdk'
import {PromiseResult} from "aws-sdk/lib/request";

export class S3Storage {
    constructor(
        private readonly s3: S3 = new AWS.S3({signatureVersion: 'v4'}),
        private readonly bucketName = process.env.ATTACHMENT_S3_BUCKET,
        private readonly urlExpiration = process.env.SIGNED_URL_EXPIRATION
    ) {
    }

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

    deleteAttachment = async (todoId: string, userId: string): Promise<PromiseResult<S3.DeleteObjectOutput, AWSError>> => {

        const params = {
            Bucket: this.bucketName,
            Key: `${userId}-${todoId}`,
        }

        return this.s3.deleteObject(params).promise();
    }
}
