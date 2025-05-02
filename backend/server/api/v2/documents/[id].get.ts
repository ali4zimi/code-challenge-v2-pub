// /server/api/documents/index.get.ts
import { ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';
import { s3, BUCKET_NAME } from '~/utils/s3Helpers';

export default defineEventHandler(async (event) => {
  const { id } = event.context.params as { id: string };
  
  // Check if the id is provided
  // If not, throw an error with a 400 status code and a message indicating the missing parameter
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing 'id' parameter in request",
    });
  }
  


  const fileUrl = await findDocumentById(id);

  if (!fileUrl) {
    throw createError({
      statusCode: 400,
      statusMessage: `Document "${id}" does not exist`,
    });
  }

  // getDocument
  const document = await s3.send(
    new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileUrl,
    })
  );

  const fileName = document.Metadata?.name || id; 
  event.node.res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

  return document.Body;

})
