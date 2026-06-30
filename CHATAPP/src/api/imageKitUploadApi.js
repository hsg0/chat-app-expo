// CHATAPP/src/api/imageKitUploadApi.js

import { upload } from "@imagekit/javascript";

import apiClient from "./apiClient";

function getFileName(uri, fallbackName) {
  const parts = uri.split("/");
  const lastPart = parts[parts.length - 1];

  if (lastPart && lastPart.includes(".")) {
    return lastPart;
  }

  return fallbackName;
}

function getFileType(kind) {
  if (kind === "video") {
    return "video/mp4";
  }

  return "image/jpeg";
}

export async function getImageKitAuth(token) {
  const response = await apiClient.get("/api/media/imagekit-auth", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

export async function uploadMediaToImageKit({
  token,
  uri,
  kind = "image",
  folder = "/chatapp/media",
}) {
  const authData = await getImageKitAuth(token);

  const fileName = getFileName(
    uri,
    kind === "video" ? "video.mp4" : "image.jpg"
  );

  const fileType = getFileType(kind);

  const uploadResult = await upload({
    file: {
      uri,
      name: fileName,
      type: fileType,
    },
    fileName,
    folder,
    publicKey: authData.publicKey,
    token: authData.token,
    signature: authData.signature,
    expire: authData.expire,
  });

  return {
    url: uploadResult.url,
    fileId: uploadResult.fileId,
    filePath: uploadResult.filePath,
    name: uploadResult.name,
    size: uploadResult.size,
    thumbnailUrl: uploadResult.thumbnailUrl || "",
    kind,
  };
}