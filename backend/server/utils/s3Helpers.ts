import { S3Client} from "@aws-sdk/client-s3";

export const BUCKET_NAME = "cocrafter-dev";

export const s3 = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: "eu-central-1",
  forcePathStyle: true,
  credentials: {
    accessKeyId: "ACCESS_KEY_ID",
    secretAccessKey: "ACCESS_KEY_SECRET",
  },
});

