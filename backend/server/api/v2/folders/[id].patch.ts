import { s3, BUCKET_NAME } from "~/utils/s3Helpers";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { findFolderById, objectExists } from "~/utils/helpers";

export default defineEventHandler(async (event) => {
  const { id } = event.context.params as { id: string };
  const { name } = await readBody(event); // Get the new name from the request body

  if (!id || !name) {
    throw createError({
      statusCode: 400,
      statusMessage: `Missing 'id' or 'name' parameter in request`,
    });
  }

  const url = await findFolderById(id);
  const parentUrl = url.split("/").slice(0, -2).join("/") + "/";

  if (!url) {
    throw createError({
      statusCode: 400,
      statusMessage: `Parent folder "${id}" does not exist`,
    });
  }

  const folderExists = await objectExists(name, parentUrl);

  if (folderExists) {
    throw createError({
      statusCode: 400,
      statusMessage: `Folder with name "${name}" already exists in the same parent folder`,
    });
  }


  // update the metadata of the folder
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: parentUrl + name.toLowerCase().replace(/\s+/g, "-") + "/",
      Metadata: {
        name: name,
      },
    })
  );

  return {
    message: `Folder "${id}" updated successfully`,
  };
});
