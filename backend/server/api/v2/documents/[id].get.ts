// /server/api/documents/index.get.ts
import { ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';
import { s3, BUCKET_NAME } from '~/utils/s3Helpers';

export default defineEventHandler(async (event) => {
  const { id } = event.context.params as { id: string };
  
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing 'id' parameter in request",
    });
  }
  
  const listResult = await s3.send(
    new ListObjectsV2Command({ Bucket: BUCKET_NAME })
  );

  const allKeys = listResult.Contents?.map(obj => obj.Key || "") ?? [];

  const matchingDocument = allKeys.find(key => {
    const parts = key.split("/").filter(Boolean);
    const isFile = !key.endsWith("/");
    return isFile && parts[parts.length - 1] === id;
  });

  if (!matchingDocument) {
    throw createError({
      statusCode: 400,
      statusMessage: `Document "${id}" does not exist`,
    });
  }

  // getDocument
  const document = await s3.send(
    new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: matchingDocument,
    })
  );

  const fileName = document.Metadata?.name || id; 
  event.node.res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

  return document.Body;

})
