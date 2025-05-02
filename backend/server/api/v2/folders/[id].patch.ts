import { s3, BUCKET_NAME } from "~/utils/s3Helpers";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { findFolderById, folderExists } from "~/utils/helpers";

export default defineEventHandler(async (event) => {
  const { id } = event.context.params as { id: string };
  const { name } = await readBody(event); // Get the new name from the request body

  // trow an error if id or name is not provided
  if (!id || !name) {
    throw createError({
      statusCode: 400,
      statusMessage: `Missing 'id' or 'name' parameter in request`,
    });
  }

  // get the url of the folder by id by calling the findFolderById function from helper functions in utils
  // this function will return the url of the folder if it exists, otherwise it will throw an error
  const url = await findFolderById(id);

  // get the parent url of the folder by removing the last two parts of the url
  const parentUrl = url.split("/").slice(0, -2).join("/") + "/";

  // check if the parent url exists, if not, throw an error
  if (!parentUrl) {
    throw createError({
      statusCode: 400,
      statusMessage: `Parent folder "${id}" does not exist`,
    });
  }


  // check if the folder with the new name already exists in the same parent folder
  // this function will return true if the folder exists, otherwise it will return false
  const isDuplicate = await folderExists(name, url);

  if (isDuplicate) {
    throw createError({
      statusCode: 400,
      statusMessage: `Folder with name "${name}" already exists in the same parent folder`,
    });
  }


  // update the metadata of the folder
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: url,
      Metadata: {
        name: name,
      },
    })
  );

  return {
    message: `Folder "${id}" updated successfully`,
  };
});
