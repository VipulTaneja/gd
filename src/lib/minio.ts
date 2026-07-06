import { Client } from "minio";

let client: Client | null = null;

function storageEndpoint(): string {
  return (
    process.env.CLOUDFLARE_R2_ENDPOINT ??
    process.env.MINIO_ENDPOINT ??
    "http://localhost:9000"
  );
}

function storageAccessKey(): string {
  return (
    process.env.CLOUDFLARE_R2_ACCESS_KEY ??
    process.env.MINIO_ACCESS_KEY ??
    "minioadmin"
  );
}

function storageSecretKey(): string {
  return (
    process.env.CLOUDFLARE_R2_SECRET_KEY ??
    process.env.MINIO_SECRET_KEY ??
    "minioadmin"
  );
}

function getClient() {
  if (!client) {
    const endpoint = storageEndpoint();
    const url = new URL(endpoint);
    const isR2 = url.hostname.endsWith(".r2.cloudflarestorage.com");

    client = new Client({
      endPoint: url.hostname,
      port: parseInt(url.port, 10) || (url.protocol === "https:" ? 443 : 9000),
      useSSL: url.protocol === "https:",
      accessKey: storageAccessKey(),
      secretKey: storageSecretKey(),
      ...(isR2 ? { region: "auto" } : {}),
    });
  }
  return client;
}

const BUCKET =
  process.env.CLOUDFLARE_R2_BUCKET ??
  process.env.MINIO_BUCKET ??
  "community-files";

export async function ensureBucket() {
  const endpoint = storageEndpoint();
  if (endpoint.includes("r2.cloudflarestorage.com")) {
    // R2 buckets are created in the Cloudflare dashboard.
    return;
  }

  const c = getClient();
  const exists = await c.bucketExists(BUCKET);
  if (!exists) {
    await c.makeBucket(BUCKET, "us-east-1");
  }
}

export async function getPresignedUploadUrl(key: string) {
  await ensureBucket();
  return getClient().presignedPutObject(BUCKET, key, 24 * 60 * 60);
}

export async function getPresignedDownloadUrl(key: string) {
  return getClient().presignedGetObject(BUCKET, key, 60 * 60);
}

export async function deleteFile(key: string) {
  await getClient().removeObject(BUCKET, key);
}

export function generateFileKey(userId: string, filename: string): string {
  const ext = filename.split(".").pop();
  const timestamp = Date.now();
  return `uploads/${userId}/${timestamp}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
}
