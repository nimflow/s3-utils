import { ListObjectsV2Command } from "@aws-sdk/client-s3";
export async function list(client, bucketName, prefix) {
    const files = [];
    let isTruncated = true;
    let continuationToken = undefined;
    while (isTruncated) {
        const command = new ListObjectsV2Command({
            Bucket: bucketName,
            Prefix: prefix,
            ContinuationToken: continuationToken,
        });
        const response = await client.send(command);
        if (Array.isArray(response.Contents))
            files.push(...response.Contents);
        isTruncated = response.IsTruncated;
        continuationToken = response.NextContinuationToken;
    }
    return files;
}
//# sourceMappingURL=s3-utils.js.map