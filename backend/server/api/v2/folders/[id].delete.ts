import { s3, BUCKET_NAME } from "~/utils/s3Helpers";
import { DeleteObjectCommand, DeleteObjectsCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { findFolderById } from "~/utils/helpers";

export default defineEventHandler(async (event) => {
  const { id } = event.context.params as { id: string };

  // Check if id is provided, otherwise throw an error
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing 'id' parameter in request",
    });
  }

  // get the folder URL from the id
  // This function should return the folder URL based on the id provided
  const folderUrl = await findFolderById(id);

  if (!folderUrl) {
    throw createError({
      statusCode: 400,
      statusMessage: `Folder "${id}" does not exist`,
    });
  }

  // delete the folder itself
  await s3.send(
    new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: folderUrl,
    })
  );

  // delete all objects inside the folder
  const listObjectsCommand = new ListObjectsV2Command({
    Bucket: BUCKET_NAME,
    Prefix: folderUrl,
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
