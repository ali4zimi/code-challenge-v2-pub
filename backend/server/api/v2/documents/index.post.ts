import { PutObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { s3, BUCKET_NAME } from "~/utils/s3Helpers";
import formidable from "formidable";
import fs from "fs/promises";
import { findFolderById, generateDocument } from "~/utils/helpers";
import { IDocument } from "~/utils/types";


export default defineEventHandler(async (event) => {
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

  const parentPath = await findFolderById(parentId);


  if (!file) {
    throw createError({ statusCode: 400, statusMessage: "No file uploaded" });
  }

  const fileBuffer = await fs.readFile(file.filepath);

  let newDocument: IDocument = await generateDocument(parentPath, file.originalFilename);  // Generate a unique name for the file

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
