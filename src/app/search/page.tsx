import type { Metadata } from "next";

import {
  parseListingParams,
  ProductListing,
} from "@/components/product/ProductListing";
import { Breadcrumb, Container } from "@/components/ui";
import { getCategoryTree, listProducts } from "@/lib/queries";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata(
  props: PageProps<"/search">,
): Promise<Metadata> {
  const params = await props.searchParams;
  const raw = params.q;
  const q = (Array.isArray(raw) ? raw[0] : raw)?.trim();

  return buildMetadata({
    title: q ? `Search results for “${q}”` : "Search",
    description: q
      ? `Products matching “${q}” at CorpoMerch — customised corporate merchandise and print in Bangladesh.`
      : "Search the CorpoMerch catalogue of customised corporate merchandise and print.",
    path: q ? `/search?q=${encodeURIComponent(q)}` : "/search",
    // A bare search page is a thin, near-duplicate page — keep it out of the
    // index. Result pages for a real query are useful and stay indexable.
    noIndex: !q,
  });
}

export default async function SearchPage(props: PageProps<"/search">) {
  const searchParams = await props.searchParams;
  const params = parseListingParams(searchParams);
  const q = params.query?.trim() ?? "";

  const [result, categories] = await Promise.all([
    q ? listProducts(params) : Promise.resolve({ products: [], total: 0, page: 1, perPage: 24, pageCount: 1 }),
    getCategoryTree(),
  ]);

  return (
    <>
      <Container>
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Search" }]} />
      </Container>

      <Container className="pb-2">
        <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          {q ? (
            <>
              Results for <span className="text-brand">“{q}”</span>
            </>
          ) : (
            "Search the catalogue"
          )}
        </h1>
        {!q ? (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
            Use the search box at the top of the page, or browse by category.
          </p>
        ) : null}
      </Container>

      <ProductListing
        products={result.products}
        total={result.total}
        page={result.page}
        pageCount={result.pageCount}
        categories={categories}
        basePath="/search"
        searchParams={searchParams}
        emptyTitle={q ? `Nothing found for “${q}”` : "Start typing to search"}
        emptyDescription="Try a shorter or more general term — “card”, “banner”, “bottle”. We also supply plenty that is not listed on the site, so it is always worth asking."
      />
    </>
  );
}
