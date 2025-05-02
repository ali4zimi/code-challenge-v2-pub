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

  // console.log("files", files);

  const tree: IFolder = {
    id: 'root',
    name: "Root",
    children: [],
    documents: [],
  };

  for (const file of files) {
    if (!file.Key) continue;

    const key = file.Key;
    const parts = key.split("/").filter(Boolean); // filter out empty parts

    let metadataName: string | undefined;

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
function insertIntoTree(node: any, parts: string[], fullPath: string, metadataName?: string) {
  const [current, ...rest] = parts;

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

  if (!child) {
    child = {
      id: current,
      name: metadataName || current, 
      children: [],
      documents: [],
    };

    node.children.push(child);
  }

  if (rest.length > 0) {
    insertIntoTree(child, rest, fullPath, metadataName);
  }
}