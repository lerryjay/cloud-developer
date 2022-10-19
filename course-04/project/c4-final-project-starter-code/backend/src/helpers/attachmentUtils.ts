import * as AWS from 'aws-sdk'
// import * as AWSXRay from 'aws-xray-sdk'

// const XAWS = AWSXRay.captureAWS(AWS)
export class AttachmentUtils {
  s3BucketName:string = process.env.ATTACHMENT_S3_BUCKET;
  createAttachmentPresignedUrl = (todoId: string) => {
    const s3 = new AWS.S3({
      signatureVersion: 'v4' // Use Sigv4 algorithm
    })
    return s3.getSignedUrl('putObject', { // The URL will allow to perform the PUT operation
      Bucket: this.s3BucketName, // Name of an S3 bucket
      Key: todoId, // id of an object this URL allows access to
      Expires: '300'  // A URL is only valid for 5 minutes
    })
  }
} 