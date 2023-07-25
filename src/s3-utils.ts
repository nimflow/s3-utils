import {
  S3Client,
  ListObjectsV2Command,
  DeleteObjectCommand,
  _Object,
} from "@aws-sdk/client-s3";

type IterateProps = {
  client: S3Client;
  bucketName: string;
  prefix?: string;
  filterExpression?: RegExp;
  modifiedBefore?: Date;
  batchLimit?: number;
  action: (files: _Object[]) => Promise<void>;
};

export async function iterate(props: IterateProps) {
  const {
    client,
    bucketName,
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
      Bucket: bucketName,
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
  bucketName: string;
  files: _Object[];
};

export async function deleteFiles(props: DeleteFilesProps) {
  const { client, files, bucketName } = props;

  for (const file of files) {
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: file.Key,
    });

    await client.send(command);
    console.log(`Deleted ${file.Key}`);
  }
}
