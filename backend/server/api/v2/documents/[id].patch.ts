import { ListObjectsV2Command, PutObjectCommand, CopyObjectCommand } from "@aws-sdk/client-s3";
import { findDocumentById, findFolderById } from "~/utils/helpers";
import { s3, BUCKET_NAME } from "~/utils/s3Helpers";

export default defineEventHandler(async (event) => {
  const { id } = event.context.params as { id: string };
  const { name } = await readBody(event);

  if (!id || !name) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing 'id' or 'newName' parameter in request",
    });
  }

  const matchingDocument = await findDocumentById(id);

  if (!matchingDocument) {
    throw createError({
      statusCode: 400,
      statusMessage: `Document "${id}" does not exist`,
    });
  }

  await s3.send(
    new CopyObjectCommand({
      Bucket: BUCKET_NAME,
      CopySource: `${BUCKET_NAME}/${matchingDocument}`,
      Key: matchingDocument,
      Metadata: {
        name: name,
      },
      MetadataDirective: "REPLACE",
    })
  );

  return {
    message: `Document "${id}" updated successfully with name "${name}"`,
  };

});
