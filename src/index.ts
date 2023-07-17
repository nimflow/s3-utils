import "dotenv/config";
import { S3Client } from "@aws-sdk/client-s3";
import { list } from "./s3-utils.js";

async function main() {
  const bucketName = process.env.S3_BUCKET_NAME;
  const prefix = process.env.S3_CONTAINER_NAME_PREFIX;

  console.log({ bucketName });

  const client = new S3Client({
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY!,
      secretAccessKey: process.env.S3_SECRET_KEY!,
    },
    region: process.env.S3_REGION,
  });

  const result = await list(client, bucketName!, prefix);
  console.log(result);
}

console.log("starting");

main();
