import Link from "next/link";
import { PackageSearch } from "lucide-react";

import {
  FilterPanel,
  MobileFilters,
  SortSelect,
} from "@/components/product/ListingControls";
import { ProductCard, ProductGrid } from "@/components/shared/ProductCard";
import { ButtonLink, Container, EmptyState } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { CategoryTreeDTO, ProductCardDTO } from "@/types/catalog";

/**
 * Shared body for /products, /categories/[slug] and /search.
 *
 * Keeping one component means the three routes cannot drift apart — the
 * reference project ended up with three near-identical listing pages and only
 * one of them ever got the empty state.
 */
export function ProductListing({
  products,
  total,
  page,
  pageCount,
  categories,
  lockedCategory,
  basePath,
  searchParams,
  emptyTitle = "No products match those filters",
  emptyDescription = "Try widening the price band or clearing a filter. If you cannot find what you need, message us — we source well beyond what is listed here.",
}: {
  products: ProductCardDTO[];
  total: number;
  page: number;
  pageCount: number;
  categories: CategoryTreeDTO[];
  lockedCategory?: string;
  basePath: string;
  searchParams: Record<string, string | string[] | undefined>;
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  const pageHref = (n: number) => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) {
      if (key === "page" || value === undefined) continue;
      params.set(key, Array.isArray(value) ? value[0] : value);
    }
    if (n > 1) params.set("page", String(n));
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  return (
    <Container className="py-8">
      <div className="flex gap-8">
        <aside className="hidden w-60 shrink-0 lg:block">
          <div className="sticky top-32">
            <FilterPanel categories={categories} lockedCategory={lockedCategory} />
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="mb-5 flex items-center justify-between gap-3">
            <p className="text-sm text-muted">
              <span className="font-semibold tabular-nums text-ink">{total}</span>{" "}
              product{total === 1 ? "" : "s"}
            </p>
            <div className="flex items-center gap-2">
              <MobileFilters
                categories={categories}
                lockedCategory={lockedCategory}
                resultCount={total}
              />
              <SortSelect />
            </div>
          </div>

          {products.length === 0 ? (
            <EmptyState
              icon={<PackageSearch className="size-10" />}
              title={emptyTitle}
              description={emptyDescription}
              action={
                <ButtonLink href="/products" variant="outline" size="sm">
                  Browse everything
                </ButtonLink>
              }
            />
          ) : (
            <>
              <ProductGrid>
                {products.map((product, i) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    priority={i < 4}
                    sizes="(min-width: 1280px) 18vw, (min-width: 1024px) 22vw, (min-width: 640px) 30vw, 45vw"
                  />
                ))}
              </ProductGrid>

              {pageCount > 1 ? (
                <nav
                  aria-label="Pagination"
                  className="mt-10 flex items-center justify-center gap-1.5"
                >
                  {page > 1 ? (
                    <Link
                      href={pageHref(page - 1)}
                      rel="prev"
                      className="rounded-lg border border-line px-3.5 py-2 text-sm font-medium text-body transition-colors hover:border-line-strong hover:text-ink"
                    >
                      Previous
                    </Link>
                  ) : null}

                  {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
                    <Link
                      key={n}
                      href={pageHref(n)}
                      aria-current={n === page ? "page" : undefined}
                      className={cn(
                        "min-w-10 rounded-lg border px-3 py-2 text-center text-sm font-medium tabular-nums transition-colors",
                        n === page
                          ? "border-brand bg-brand text-white"
                          : "border-line text-body hover:border-line-strong hover:text-ink",
                      )}
                    >
                      {n}
                    </Link>
                  ))}

                  {page < pageCount ? (
                    <Link
                      href={pageHref(page + 1)}
                      rel="next"
                      className="rounded-lg border border-line px-3.5 py-2 text-sm font-medium text-body transition-colors hover:border-line-strong hover:text-ink"
                    >
                      Next
                    </Link>
                  ) : null}
                </nav>
              ) : null}
            </>
          )}
        </div>
      </div>
    </Container>
  );
}

/** Shared parser so the three listing routes read params identically. */
export function parseListingParams(
  searchParams: Record<string, string | string[] | undefined>,
) {
  const get = (key: string) => {
    const raw = searchParams[key];
    return Array.isArray(raw) ? raw[0] : raw;
  };

  const [minRaw, maxRaw] = (get("price") ?? "").split("-");
  const minPrice = minRaw ? Number(minRaw) : undefined;
  const maxPrice = maxRaw ? Number(maxRaw) : undefined;
  const moq = get("moq");

  return {
    sort: (get("sort") ?? "featured") as
      | "featured"
      | "name"
      | "price-asc"
      | "price-desc"
      | "newest",
    unit: get("unit"),
    minPrice: Number.isFinite(minPrice) ? minPrice : undefined,
    maxPrice: Number.isFinite(maxPrice) ? maxPrice : undefined,
    maxMoq: moq ? Number(moq) : undefined,
    hasVariants: get("variants") === "1",
    page: Math.max(1, Number(get("page")) || 1),
    query: get("q"),
  };
}
