import { randomUUID } from "crypto";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "../config/s3.js";
import { env } from "../config/env.js";
import { prisma } from "../config/prisma.js";
import { AppError } from "../lib/api-error.js";
import type {
  UploadUrlInput,
  RegisterMediaInput,
} from "../validators/media.validators.js";
import type { AssetType } from "@prisma/client";

const MIME_TO_EXT: Record<string, string> = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
};

export async function generateUploadUrl(userId: string, input: UploadUrlInput) {
  const ext = MIME_TO_EXT[input.mime_type];
  const uniqueId = randomUUID();
  const storageKey = `users/${userId}/${input.asset_type}/${uniqueId}${ext}`;

  const command = new PutObjectCommand({
    Bucket: env.s3Bucket,
    Key: storageKey,
    ContentType: input.mime_type,
    ContentLength: input.file_size_bytes,
  });

  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });

  return {
    upload_url: uploadUrl,
    storage_key: storageKey,
  };
}

export async function registerAsset(userId: string, input: RegisterMediaInput) {
  if (!input.storage_key.startsWith(`users/${userId}/`)) {
    throw AppError.forbidden("You do not own this storage key");
  }

  const existing = await prisma.mediaAsset.findUnique({
    where: { storageKey: input.storage_key },
  });

  if (existing) {
    throw AppError.conflict("MEDIA_EXISTS", "This file has already been registered");
  }

  const publicUrl = `${env.cloudfrontBaseUrl}/${input.storage_key}`;

  const asset = await prisma.mediaAsset.create({
    data: {
      id: randomUUID(),
      ownerUserId: userId,
      storageKey: input.storage_key,
      publicUrl,
      mimeType: input.mime_type,
      fileSizeBytes: BigInt(input.file_size_bytes),
      width: input.width ?? null,
      height: input.height ?? null,
      assetType: input.asset_type as AssetType,
    },
  });

  return formatAsset(asset);
}

export async function softDeleteAsset(userId: string, mediaId: string) {
  const asset = await prisma.mediaAsset.findFirst({
    where: { id: mediaId, ownerUserId: userId, deletedAt: null },
  });

  if (!asset) throw AppError.notFound("Media asset");

  await prisma.mediaAsset.update({
    where: { id: mediaId },
    data: { deletedAt: new Date() },
  });
}

function formatAsset(asset: {
  id: string;
  storageKey: string;
  publicUrl: string;
  mimeType: string;
  fileSizeBytes: bigint;
  width: number | null;
  height: number | null;
  assetType: string;
  createdAt: Date;
}) {
  return {
    id: asset.id,
    storage_key: asset.storageKey,
    public_url: asset.publicUrl,
    mime_type: asset.mimeType,
    file_size_bytes: Number(asset.fileSizeBytes),
    width: asset.width,
    height: asset.height,
    asset_type: asset.assetType,
    created_at: asset.createdAt,
  };
}
