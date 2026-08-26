import { Loader2 } from "lucide-react";

import { ProductCardSkeleton } from "@/components/shared/ProductCard";
import { Container, Skeleton } from "@/components/ui";
import { cn } from "@/lib/utils";

type LoaderSize = "sm" | "md" | "lg";

const sizeClasses: Record<LoaderSize, string> = {
  sm: "size-4",
  md: "size-6",
  lg: "size-9",
};

/** Inline spinner — use inside buttons or compact hints. */
export function Spinner({
  size = "md",
  className,
}: {
  size?: LoaderSize;
  className?: string;
}) {
  return (
    <Loader2
      aria-hidden
      className={cn("animate-spin text-brand", sizeClasses[size], className)}
    />
  );
}

/** Centred loader block for route-level fallbacks. */
export function Loader({
  label = "Loading…",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cn(
        "flex flex-col items-center justify-center gap-3 text-center",
        className,
      )}
    >
      <Spinner size="lg" />
      <p className="text-sm font-medium text-muted">{label}</p>
    </div>
  );
}

/** Full-viewport overlay shown during client-side navigations. */
export function NavigationOverlay({
  visible,
  label = "Loading page…",
}: {
  visible: boolean;
  label?: string;
}) {
  return (
    <div
      aria-hidden={!visible}
      className={cn(
        "pointer-events-none fixed inset-0 z-90 flex items-start justify-center bg-white/72 backdrop-blur-[2px] transition-opacity duration-200",
        visible ? "opacity-100" : "opacity-0",
      )}
    >
      <div
        className={cn(
          "mt-[18vh] flex flex-col items-center gap-3 rounded-2xl border border-line bg-white/95 px-8 py-7 shadow-lg transition-all duration-200",
          visible ? "translate-y-0 scale-100" : "-translate-y-1 scale-[0.98]",
        )}
      >
        <Spinner size="lg" />
        <p className="text-sm font-medium text-ink">{label}</p>
      </div>
    </div>
  );
}

/** Thin top bar for long navigations. */
export function NavigationProgressBar({ visible }: { visible: boolean }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none fixed inset-x-0 top-0 z-95 h-0.5 overflow-hidden transition-opacity duration-150",
        visible ? "opacity-100" : "opacity-0",
      )}
    >
      <div className="h-full w-full origin-left animate-[nav-progress_1.1s_ease-in-out_infinite] bg-brand" />
    </div>
  );
}

export function SimplePageSkeleton() {
  return (
    <Container className="py-10">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="mt-6 h-9 w-72 max-w-full" />
      <div className="mt-8 max-w-3xl space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[92%]" />
        <Skeleton className="h-4 w-[84%]" />
        <Skeleton className="h-4 w-[76%]" />
      </div>
    </Container>
  );
}

export function ListingPageSkeleton() {
  return (
    <Container className="py-10">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="mt-6 h-9 w-56" />
      <Skeleton className="mt-3 h-4 w-full max-w-2xl" />
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </Container>
  );
}

export function ProductPageSkeleton() {
  return (
    <Container className="pb-12">
      <Skeleton className="my-4 h-4 w-56" />
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <Skeleton className="aspect-square w-full rounded-xl" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-[80%]" />
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-11 w-full rounded-lg" />
          <Skeleton className="h-11 w-full rounded-lg" />
        </div>
      </div>
    </Container>
  );
}
