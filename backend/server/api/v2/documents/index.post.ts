import { PutObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { s3, BUCKET_NAME } from "~/utils/s3Helpers";
import formidable from "formidable";
import fs from "fs/promises";
import { findFolderById, generateDocument } from "~/utils/helpers";
import { IDocument } from "~/utils/types";

export default defineEventHandler(async (event) => {
  // I used the 'formidable' package to handle file uploads
  // and parse the form data. The 'multiples' option is set to false to handle single file uploads.
  const form = formidable({ multiples: false });

  // Parse form data (including file and text fields)
  const { fields, files } = await new Promise<{ fields: any; files: any }>(
    (resolve, reject) => {
      form.parse(event.node.req, (err, fields, files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    }
  );

  const file = files.data?.[0];
  const parentId = fields.parentId?.[0] || "";

  // Check if the parentId is provided
  if (!parentId) {
    throw createError({ statusCode: 400, statusMessage: "No parentId provided" });
  }

  // throw an error if no file is uploaded
  if (!file) {
    throw createError({ statusCode: 400, statusMessage: "No file uploaded" });
  }

  // get the parent folder path using the parentId
  const parentPath = await findFolderById(parentId);

  const fileBuffer = await fs.readFile(file.filepath);

  // prerpare document object to be uploaded to s3
  let newDocument: IDocument = await generateDocument(
    parentPath,
    file.originalFilename
  ); 

  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: parentPath + newDocument.id,
      Body: fileBuffer,
      Metadata: {
        name: newDocument.name,
      },
    })
  );

  // Clean up the temporary file
  await fs.unlink(file.filepath);

  return {
    message: `File "${newDocument}" uploaded successfully`,
  };
});
