import { s3, BUCKET_NAME } from "~/utils/s3Helpers";
import { DeleteObjectCommand, DeleteObjectsCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { findFolderById } from "~/utils/helpers";

export default defineEventHandler(async (event) => {
  const { id } = event.context.params as { id: string };

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing 'id' parameter in request",
    });
  }


  const matchingFolder = await findFolderById(id);

  if (!matchingFolder) {
    throw createError({
      statusCode: 400,
      statusMessage: `Folder "${id}" does not exist`,
    });
  }

  // Delete the folder
  await s3.send(
    new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: matchingFolder,
    })
  );

  // delete all objects inside the folder
  const listObjectsCommand = new ListObjectsV2Command({
    Bucket: BUCKET_NAME,
    Prefix: matchingFolder,
  });
  const listObjectsResult = await s3.send(listObjectsCommand);
  const objectsToDelete = listObjectsResult.Contents?.map((obj) => ({ Key: obj.Key })) || [];

  s3.send(
    new DeleteObjectsCommand({
      Bucket: BUCKET_NAME,
      Delete: {
        Objects: objectsToDelete,
        Quiet: false,
      },
    })
  );
  
  return {
    message: `Folder "${id}" deleted successfully`,
  };

});
