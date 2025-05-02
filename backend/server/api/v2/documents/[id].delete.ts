import { ListObjectsV2Command, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { findDocumentById, findFolderById } from "~/utils/helpers";
import { s3, BUCKET_NAME } from "~/utils/s3Helpers";

export default defineEventHandler(async (event) => {
  const { id } = event.context.params as { id: string };

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing 'id' in request",
    });
  }


  const matchingDocument = await findDocumentById(id);

  if (!matchingDocument) {
    throw createError({
      statusCode: 400,
      statusMessage: `Document "${id}" does not exist`,
    });
  }

  // delete the document
  await s3.send(
    new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: matchingDocument,
    })
  );

  return {
    message: `Document "${id}" deleted successfully`,
  };
});
