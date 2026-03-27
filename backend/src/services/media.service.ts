import { v4 as uuid } from "uuid";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "../config/s3.js";
import { env } from "../config/env.js";
import { prisma } from "../config/prisma.js";
import { AppError } from "../lib/api-error.js";
import type { AssetType } from "@prisma/client";

const ALLOWED_MIME_TYPES = ["image/png", "image/jpeg"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const MIME_EXT: Record<string, string> = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
};

export async function generateUploadUrl(
  userId: string,
  data: {
    file_name: string;
    mime_type: string;
    file_size_bytes: number;
    asset_type: AssetType;
  },
) {
  if (!ALLOWED_MIME_TYPES.includes(data.mime_type)) {
    throw AppError.badRequest("INVALID_MIME_TYPE", "Only image/png and image/jpeg are allowed");
  }
  if (data.file_size_bytes > MAX_FILE_SIZE) {
    throw AppError.badRequest("FILE_TOO_LARGE", "Max file size is 5 MB");
  }

  const ext = MIME_EXT[data.mime_type];
  const mediaId = uuid();
  const storageKey = `users/${userId}/${data.asset_type}/${mediaId}${ext}`;

  const command = new PutObjectCommand({
    Bucket: env.s3Bucket,
    Key: storageKey,
    ContentType: data.mime_type,
    ContentLength: data.file_size_bytes,
  });

  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 600 });

  return { upload_url: uploadUrl, storage_key: storageKey };
}

export async function registerMediaAsset(
  userId: string,
  data: {
    storage_key: string;
    asset_type: AssetType;
    mime_type: string;
    file_size_bytes: number;
    width?: number | null;
    height?: number | null;
  },
) {
  if (!ALLOWED_MIME_TYPES.includes(data.mime_type)) {
    throw AppError.badRequest("INVALID_MIME_TYPE", "Only image/png and image/jpeg are allowed");
  }

  if (!data.storage_key.startsWith(`users/${userId}/`)) {
    throw AppError.forbidden("Cannot register media for another user");
  }

  const publicUrl = `${env.cloudfrontBaseUrl}/${data.storage_key}`;

  const media = await prisma.mediaAsset.create({
    data: {
      id: uuid(),
      ownerUserId: userId,
      storageKey: data.storage_key,
      publicUrl,
      mimeType: data.mime_type,
      fileSizeBytes: BigInt(data.file_size_bytes),
      width: data.width ?? null,
      height: data.height ?? null,
      assetType: data.asset_type,
    },
  });

  if (data.asset_type === "avatar") {
    await prisma.profile.updateMany({
      where: { userId },
      data: { avatarMediaId: media.id },
    });
  }

  return {
    id: media.id,
    storage_key: media.storageKey,
    public_url: media.publicUrl,
    mime_type: media.mimeType,
    file_size_bytes: Number(media.fileSizeBytes),
    asset_type: media.assetType,
  };
}
