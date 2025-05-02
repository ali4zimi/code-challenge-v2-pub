import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3, BUCKET_NAME } from "~/utils/s3Helpers";
import { findFolderById, generateFolder } from "~/utils/helpers";
import { IFolder } from "~/utils/types";

export default defineEventHandler(async (event) => {
  

  const body = await readBody(event);
  const { parentId } = body as { parentId: string };



  if (!parentId) {
    throw createError({
      statusCode: 400,
      statusMessage: `Missing 'parentId' parameter in request`,
    });
  }

  const folderUrl = await findFolderById(parentId);
  console.log("parentId", parentId);
  console.log("folderUrl", folderUrl);

  let folder: IFolder = await generateFolder(folderUrl) // Generate a unique name for the folder

  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: folder.id,
      Metadata: {
        name: folder.name,
      },
    })
  );

  return {
    message: `Folder "${folder.name}" created successfully`,
  };
});
