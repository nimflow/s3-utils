import {
  S3Client,
  ListObjectsV2Command,
  DeleteObjectCommand,
  _Object,
  PutObjectCommand,
} from "@aws-sdk/client-s3";

type IterateProps = {
  client: S3Client;
  bucket: string;
  prefix?: string;
  filterExpression?: RegExp;
  modifiedBefore?: Date;
  batchLimit?: number;
  action: (files: _Object[]) => Promise<void>;
};

export async function iterate(props: IterateProps) {
  const {
    client,
    bucket,
    prefix,
    action,
    filterExpression,
    modifiedBefore,
    batchLimit,
  } = props;
  let isTruncated = true;
  let continuationToken: string | undefined;
  let count = 0;

  while (isTruncated) {
    const command = new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: prefix,
      ContinuationToken: continuationToken,
    });

    const response = await client.send(command);

    if (Array.isArray(response.Contents)) {
      const files = response.Contents.filter((file) => {
        if (
          modifiedBefore != null &&
          file.LastModified &&
          file.LastModified >= modifiedBefore
        ) {
          return false;
        }
        return (
          !filterExpression || (file.Key && filterExpression.test(file.Key))
        );
      });
      await action(files);
      count += files.length;
      if (batchLimit && count >= batchLimit) {
        break;
      }
    }

    isTruncated = !!response.IsTruncated;
    continuationToken = response.NextContinuationToken;
  }
}

type DeleteFilesProps = {
  client: S3Client;
  bucket: string;
  files: _Object[];
};

export async function deleteFiles(props: DeleteFilesProps) {
  const { client, files, bucket } = props;

  for (const file of files) {
    const command = new DeleteObjectCommand({
      Bucket: bucket,
      Key: file.Key,
    });

    await client.send(command);
    console.log(`Deleted ${file.Key}`);
  }
}

export async function createTestFiles(props: {
  client: S3Client;
  count: number;
  bucket: string;
  prefix: string;
}) {
  const { client, count, bucket, prefix } = props;
  for (let i = 0; i < count; i++) {
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: `${prefix}/testing_${i}.txt`,
      Body: `${i}-${new Date().toISOString()}`,
    });

    try {
      const response = await client.send(command);
      console.log(response);
    } catch (err) {
      console.error(err);
    }
  }
}
