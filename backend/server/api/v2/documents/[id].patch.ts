import { ListObjectsV2Command, PutObjectCommand, CopyObjectCommand } from "@aws-sdk/client-s3";
import { fileExists, findDocumentById, findFolderById } from "~/utils/helpers";
import { s3, BUCKET_NAME } from "~/utils/s3Helpers";

export default defineEventHandler(async (event) => {
  const { id } = event.context.params as { id: string };
  const { name } = await readBody(event);

  // Check if the id or name is provided
  // If not, throw an error with a 400 status code and a message indicating the missing parameter
  if (!id || !name) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing 'id' or 'newName' parameter in request",
    });
  }

  // Get the parent folder path using the id
  const fileUrl = await findDocumentById(id);
  console.log("fileUrl", fileUrl);

  // throw an error if the file does not exist
  if (!fileUrl) {
    throw createError({
      statusCode: 400,
      statusMessage: `Document "${id}" does not exist`,
    });
  }

  // Check if the new name already exists in the same folder
  const isDuplicate = await fileExists(name, fileUrl);
  if (isDuplicate) {
    throw createError({
      statusCode: 400,
      statusMessage: `File with name "${name}" already exists in the same folder`,
    });
  }


  // I found it the only way to update the name of a file in S3 is to copy it to the same location with the new name and delete the old one.
  // This is because S3 does not support renaming files directly.
  // So, I will copy the file to the same location with the new name and delete the old one.
  // ref: https://stackoverflow.com/questions/32646646/how-do-i-update-metadata-for-an-existing-amazon-s3-file
  await s3.send(
    new CopyObjectCommand({
      Bucket: BUCKET_NAME,
      CopySource: `${BUCKET_NAME}/${fileUrl}`,
      Key: fileUrl,
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
