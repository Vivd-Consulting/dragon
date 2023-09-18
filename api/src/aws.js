import {
  S3Client,
  GetObjectCommand
} from "@aws-sdk/client-s3";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { SSMClient } from "@aws-sdk/client-ssm";

const { S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_BUCKET, SES_SENDER, AWS_REGION } = process.env;

const isDev = process.env.NODE_ENV === 'development';

export const s3Client = new S3Client(isDev ? {
  credentials: {
    accessKeyId: S3_ACCESS_KEY_ID,
    secretAccessKey: S3_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true,
  region: AWS_REGION
} : {
  forcePathStyle: true
});

const sesClient = new SESClient(isDev ? {
  credentials: {
    accessKeyId: S3_ACCESS_KEY_ID,
    secretAccessKey: S3_SECRET_ACCESS_KEY,
  },
  region: AWS_REGION
} : {});

export const ssmClient = new SSMClient(isDev ? {
  credentials: {
    accessKeyId: S3_ACCESS_KEY_ID,
    secretAccessKey: S3_SECRET_ACCESS_KEY,
  },
  region: AWS_REGION
} : {});

export async function getFile(Key) {
  const params = {
    Bucket: S3_BUCKET,
    Key,
  };

  const command = new GetObjectCommand(params);
  const asset = await s3Client.send(command);

  return asset.Body;
}

function buildEmailCommand({ to, subject, html }) {
  return new SendEmailCommand({
    Destination: {
      ToAddresses: [to]
    },
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: html,
        }
      },
      Subject: {
        Charset: "UTF-8",
        Data: subject,
      }
    },
    Source: SES_SENDER
  });
};

export function sendEmail({ to, subject, html }) {
  const sendEmailCommand = buildEmailCommand({
    to,
    subject,
    html
  });

  return sesClient.send(sendEmailCommand);
}
