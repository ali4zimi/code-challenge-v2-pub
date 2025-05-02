import { s3, BUCKET_NAME } from "./s3Helpers";
import { ListObjectsV2Command, HeadObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import { IFolder, IDocument } from "./types";

export function generateRandomId() {
  return uuidv4();
}

// This function searches for a folder by its ID in the S3 bucket and
// returns the folder's key if found, or an empty string if not found.
export async function findFolderById(id: string): Promise<string> {
  const listResult = await s3.send(
    new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
    })
  );
  const allKeys = listResult.Contents?.map((obj) => obj.Key || "") ?? [];

  return (
    allKeys.find((key) => {
      const parts = key.split("/").filter(Boolean);
      const isFolder = key.endsWith("/");
      return isFolder && parts[parts.length - 1] === id;
    }) || ""
  );
}

// This function searches for a document by its ID in the S3 bucket and
// returns the document's key if found, or an empty string if not found.
export async function findDocumentById(id: string): Promise<string> {
  const listResult = await s3.send(
    new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
    })
  );
  const allKeys = listResult.Contents?.map((obj) => obj.Key || "") ?? [];

  return (
    allKeys.find((key) => {
      const parts = key.split("/").filter(Boolean);
      const isFile = !key.endsWith("/") && parts[parts.length - 1] === id;
      return isFile;
    }) || ""
  );
}

export async function objectExists(objectName: string, url?: string): Promise<boolean> {
  // split it using slashes and remove the until two last slashes
  const parentFolderUrl = url.split("/").slice(0, -2).join("/") + "/";
  
  const listResult = await s3.send(
    new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: parentFolderUrl == '/' ? '' : parentFolderUrl, // it should be empty or a url
      Delimiter: '/'
    })
  );  

  // console.log("listResult", listResult)

  const allKeys = listResult.CommonPrefixes?.map((obj) => obj.Prefix || "") ?? [];
  // console.log("allkeys", allKeys)

  for (const key of allKeys) {
    const headResult = await s3.send(
      new HeadObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      })
    );
    const metadataName = headResult.Metadata?.name;
    if (metadataName === objectName) {
      return true; // Object exists
    }
  }
  
  return false; // Object does not exist
}


export async function generateFolder(ParentUrl?: string): Promise<IFolder> {
  const listResult = await s3.send(
    new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: ParentUrl || "",
      Delimiter: "/"
    })
  );

  const allKeys = listResult.CommonPrefixes?.map((obj) => obj.Prefix || "") ?? [];

  const existingUntitledFolders: string[] = [];
  // console.log("parentUrl", ParentUrl)
  // console.log("allKeys", allKeys)

  for (const key of allKeys) {
    const headResult = await s3.send(
      new HeadObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      })
    );
    const metadataName = headResult.Metadata?.name;
    if (metadataName?.startsWith("Untitled")) {
      existingUntitledFolders.push(metadataName);
    }
  }

  let nextUntitledNumber = 0;

  for (const name of existingUntitledFolders) {
    if (name === "Untitled") {
      nextUntitledNumber = Math.max(nextUntitledNumber, 1);
    } else if (name.startsWith("Untitled-")) {
      const parts = name.split("-");
      const number = parseInt(parts[1], 10);
      if (!isNaN(number)) {
        nextUntitledNumber = Math.max(nextUntitledNumber, number + 1);
      }
    }
  }

  const newFolderName = nextUntitledNumber === 0 ? "Untitled" : `Untitled-${nextUntitledNumber}`;
  const newFolder: IFolder = {
    id: ParentUrl + generateRandomId() + "/",
    name: newFolderName,
  };
  return newFolder;
}


export async function generateDocument(ParentUrl?: string, originalName?: string): Promise<IDocument> {
  const listResult = await s3.send(
    new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: ParentUrl || "",
      Delimiter: "/"
    })
  );

  const allKeys = listResult.CommonPrefixes?.map((obj) => obj.Prefix || "") ?? [];

  const existingUntitledDocuments: string[] = [];

  for (const key of allKeys) {
    const headResult = await s3.send(
      new HeadObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      })
    );
    const metadataName = headResult.Metadata?.name;
    if (metadataName?.startsWith("Untitled")) {
      existingUntitledDocuments.push(metadataName);
    }
  }

  let nextUntitledNumber = 0;

  for (const name of existingUntitledDocuments) {
    if (name === originalName) {
      nextUntitledNumber = Math.max(nextUntitledNumber, 1);
    }
    else if (name.startsWith(originalName)) {
      const parts = name.split("-");
      const number = parseInt(parts[1], 10);
      if (!isNaN(number)) {
        nextUntitledNumber = Math.max(nextUntitledNumber, number + 1);
      }
    }
  }

  const newDocumentName = nextUntitledNumber === 0 ? "Untitled" : `Untitled-${nextUntitledNumber}`;
  const newDocument: IDocument = {
    id: originalName?.toLowerCase().replace(/\s+/g, "-") ,
    name: originalName || newDocumentName,
  };
  return newDocument;
}