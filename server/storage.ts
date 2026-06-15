// Object storage on DO Spaces (migration M3.1) — S3-compatible.
// Public interface (storagePut / storageGet / storageDelete) is unchanged from
// the previous Forge implementation, so callers in routers.ts are untouched.

import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { ENV } from "./_core/env";

type SpacesConfig = {
  client: S3Client;
  bucket: string;
  publicBaseUrl: string;
};

let _config: SpacesConfig | null = null;

function getSpacesConfig(): SpacesConfig {
  if (_config) return _config;
  const { spacesEndpoint, spacesRegion, spacesBucket, spacesKey, spacesSecret } = ENV;
  if (!spacesEndpoint || !spacesBucket || !spacesKey || !spacesSecret) {
    throw new Error(
      "DO Spaces not configured: set SPACES_ENDPOINT, SPACES_BUCKET, SPACES_KEY, SPACES_SECRET"
    );
  }
  const client = new S3Client({
    endpoint: spacesEndpoint,
    region: spacesRegion,
    credentials: { accessKeyId: spacesKey, secretAccessKey: spacesSecret },
    forcePathStyle: false,
  });
  // Public URL base: explicit CDN/base if given, else virtual-hosted Spaces URL.
  const publicBaseUrl =
    ENV.spacesPublicBaseUrl.replace(/\/+$/, "") ||
    `${spacesEndpoint.replace(/^https?:\/\//, `https://${spacesBucket}.`).replace(/\/+$/, "")}`;
  _config = { client, bucket: spacesBucket, publicBaseUrl };
  return _config;
}

function normalizeKey(relKey: string): string {
  return relKey.replace(/^\/+/, "");
}

function toBody(data: Buffer | Uint8Array | string): Buffer | Uint8Array | string {
  return data;
}

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  const { client, bucket, publicBaseUrl } = getSpacesConfig();
  const key = normalizeKey(relKey);
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: toBody(data),
      ContentType: contentType,
      ACL: "public-read",
    })
  );
  return { key, url: `${publicBaseUrl}/${key}` };
}

export async function storageGet(
  relKey: string
): Promise<{ key: string; url: string }> {
  const { client, bucket } = getSpacesConfig();
  const key = normalizeKey(relKey);
  // Presigned GET (works for private objects too); valid 1h.
  const url = await getSignedUrl(
    client,
    new GetObjectCommand({ Bucket: bucket, Key: key }),
    { expiresIn: 3600 }
  );
  return { key, url };
}

/**
 * Best-effort delete (retro/migration): never throws — orphan cleanup must not
 * fail the user's action. No-op on empty key.
 */
export async function storageDelete(relKey: string | null | undefined): Promise<void> {
  if (!relKey) return;
  try {
    const { client, bucket } = getSpacesConfig();
    await client.send(
      new DeleteObjectCommand({ Bucket: bucket, Key: normalizeKey(relKey) })
    );
  } catch (error) {
    console.warn("[Storage] best-effort delete failed:", error);
  }
}
