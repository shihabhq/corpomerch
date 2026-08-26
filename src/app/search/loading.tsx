import { ListingPageSkeleton } from "@/components/shared/Loader";

/**
 * Safe to have a loading.tsx here: /search has no descendant route that can
 * call notFound(). See CLAUDE.md — a loading.tsx anywhere above a 404-capable
 * page turns its 404 into a soft 200.
 */
export default function Loading() {
  return <ListingPageSkeleton />;
}
