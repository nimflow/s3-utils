/* eslint-disable @typescript-eslint/no-unused-vars */
import "dotenv/config";
import { S3Client } from "@aws-sdk/client-s3";
import { createTestFiles, deleteFiles, iterate } from "./s3-utils.js";

const bucket = process.env.S3_BUCKET_NAME;
const prefix = process.env.S3_CONTAINER_NAME_PREFIX;
const accessKeyId = process.env.S3_ACCESS_KEY;
const secretAccessKey = process.env.S3_SECRET_KEY;
const endpoint = process.env.S3_SECRET_KEY;

if (!bucket) throw new Error("S3_BUCKET_NAME is not defined");
if (!accessKeyId) throw new Error("S3_ACCESS_KEY is not defined");
if (!secretAccessKey) throw new Error("S3_SECRET_KEY is not defined");

const client = new S3Client({
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
  region: process.env.S3_REGION,
  endpoint,
});

//Si no es = undefined, se filtra por aquellos archivos que hayan sido modificados antes de la fecha indicada
const modifiedBefore = new Date("2022-10-21");
//Si no es = undefined, se filtra por aquellos archivos cuyo key cumpla con la expresión regular
const filterExpression = /_\d+\.tiff$/;
//Si no es = undefined, se limita la cantidad de lotes de archivos a procesar. Cada lote tiene un máximo definido por S3 de 1000 archivos
const batchLimit = 1;

const listS3Files = async () =>
  iterate({
    client,
    bucket,
    prefix,
    filterExpression,
    modifiedBefore,
    batchLimit,
    action: async (files) => console.log(files),
  });

const deleteS3Files = async () =>
  iterate({
    client,
    bucket: bucket,
    prefix,
    filterExpression,
    modifiedBefore,
    batchLimit,
    action: async (files) =>
      deleteFiles({
        client,
        files,
        bucket,
      }),
  });

const deleteTestFiles = async () =>
  iterate({
    client,
    bucket: bucket,
    prefix: `${prefix}/testingUtils`,
    filterExpression: /_\d+\.txt$/,
    action: async (files) => deleteFiles({ client, files, bucket }),
  });

// createTestFiles({
//   client,
//   count: 1100,
//   bucket: bucket,
//   prefix: `${prefix}/testingUtils`,
// });
//deleteTestFiles();

listS3Files();
//deleteS3Files();
