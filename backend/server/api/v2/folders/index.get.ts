import { ListObjectsV2Command, HeadObjectCommand } from "@aws-sdk/client-s3";
import { s3, BUCKET_NAME } from "~/utils/s3Helpers";
import { IDocument, IFolder } from "~/utils/types";

export default defineEventHandler(async (event) => {
  const list = await s3.send(
    new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
    })
  );

  const files = list.Contents || [];

  // Initialize the root of the tree structure
  // The root folder is represented as an object with an id, name, children, and documents properties
  // The id is set to "root" and the name is set to "Root" as stated in the sample
  const tree: IFolder = {
    id: 'root',
    name: "Root",
    children: [],
    documents: [],
  };

  // Iterate over each file in the list of files
  for (const file of files) {
    if (!file.Key) continue;

    const key = file.Key;
    const parts = key.split("/").filter(Boolean); // filter out empty parts

    let metadataName: string | undefined;

    // Since we need the metadata, we need to use the HeadObjectCommand to get the metadata for each file
    // because the ListObjectsV2Command does not return the metadata
    try {
      const head = await s3.send(new HeadObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key
      }));
      metadataName = head.Metadata?.name;
    } catch (err) {
      console.warn(`Failed to fetch metadata for: ${key}`, err);
    }

    insertIntoTree(tree, parts, key, metadataName);
  }

  return tree;
});

// Helper function to insert a file or folder into the tree structure
// Since only this file uses this function, we can keep it here instead of moving it to utils
// This function is recursive and builds the tree structure based on the parts of the key
function insertIntoTree(node: any, parts: string[], fullPath: string, metadataName?: string) {
  const [current, ...rest] = parts;

  // Check if the current part is a file or folder
  // A file is identified by the absence of a trailing slash and no remaining parts
  // A folder is identified by the presence of a trailing slash or remaining parts
  // For example, "folder1/folder2/" is a folder, while "folder1/file.txt" is a file
  const isFile = !fullPath.endsWith("/") && rest.length === 0;

  // Handle file
  if (isFile) {
    const file: IDocument = {
      id: current,
      name: metadataName || current,
    };

    node.documents.push(file);

    return;
  }

  // Handle folder
  node.children = node.children || [];

  let child: IFolder = node.children.find((child: IFolder) => child.id === current);

  // If the child doesn't exist, create it
  // We use the metadataName as the name of the folder if it exists, otherwise we use the current part
  if (!child) {
    child = {
      id: current,
      name: metadataName || current, 
      children: [],
      documents: [],
    };

    node.children.push(child);
  }

  // If there are more parts, we need to go deeper into the tree
  // We pass the remaining parts to the next level of the tree
  if (rest.length > 0) {
    insertIntoTree(child, rest, fullPath, metadataName);
  }
}