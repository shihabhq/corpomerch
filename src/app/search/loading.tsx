import { ProductCardSkeleton } from "@/components/shared/ProductCard";
import { Container } from "@/components/ui";

/**
 * Safe to have a loading.tsx here: /search has no descendant route that can
 * call notFound(). See CLAUDE.md — a loading.tsx anywhere above a 404-capable
 * page turns its 404 into a soft 200.
 */
export default function Loading() {
  return (
    <Container className="py-10">
      <div className="h-8 w-64 animate-pulse rounded-lg bg-surface-alt" />
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </Container>
  );
}
