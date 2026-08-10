/**
 * Product images live in one of two places, and callers should not care which:
 *
 *   storagePath  — an object in the Supabase `product-images` bucket (normal)
 *   externalUrl  — a file under /public (the seed's fallback when
 *                  SUPABASE_SECRET_KEY was not set at seed time)
 *
 * Always build URLs through here so the bucket host can change without a data
 * migration.
 */

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://hdmonhqhsaomwskzktdm.supabase.co";

const BUCKET = "product-images";

export const PLACEHOLDER_IMAGE = "/placeholder-product.svg";

export interface ImageSource {
  storagePath?: string | null;
  externalUrl?: string | null;
}

export function imageUrl(source: ImageSource | null | undefined): string {
  if (!source) return PLACEHOLDER_IMAGE;
  if (source.externalUrl) return source.externalUrl;
  if (source.storagePath) {
    return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${source.storagePath}`;
  }
  return PLACEHOLDER_IMAGE;
}

export function assetUrl(
  path: string | null | undefined,
  bucket = "site-assets",
): string | null {
  if (!path) return null;
  if (path.startsWith("http") || path.startsWith("/")) return path;
  return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
}
