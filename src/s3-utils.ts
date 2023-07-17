import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";

export async function list(
  client: S3Client,
  bucketName: string,
  prefix?: string
) {
  const files = [];

  let isTruncated = true;
  let continuationToken: string | undefined;

  while (isTruncated) {
    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: prefix,
      ContinuationToken: continuationToken,
    });

    const response = await client.send(command);

    if (Array.isArray(response.Contents))
      files.push(...(response.Contents as []));

    isTruncated = !!response.IsTruncated;
    continuationToken = response.NextContinuationToken;
  }

  return files;
}
