import type { Metadata } from "next";

import {
  parseListingParams,
  ProductListing,
} from "@/components/product/ProductListing";
import { JsonLd } from "@/components/shared/JsonLd";
import { Breadcrumb, Container } from "@/components/ui";
import { getCategoryTree, listProducts } from "@/lib/queries";
import { buildMetadata, itemListSchema } from "@/lib/seo";

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: "All Products: Corporate Merchandise & Print",
  description:
    "The full CorpoMerch catalogue: ID cards, lanyards, keyrings, pens, drinkware, bags, certificates, magazines, banners and backdrops. Bulk pricing and MOQs shown on every product.",
  path: "/products",
});

export default async function ProductsPage(props: PageProps<"/products">) {
  const searchParams = await props.searchParams;
  const params = parseListingParams(searchParams);

  const [result, categories] = await Promise.all([
    listProducts(params),
    getCategoryTree(),
  ]);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "All Products",
          description:
            "The full CorpoMerch catalogue of customised corporate merchandise and print.",
          mainEntity: itemListSchema(result.products, "All Products"),
        }}
      />

      <Container>
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Products" }]} />
      </Container>

      <Container className="pb-2">
        <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          All products
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          Everything we brand and print, with live quantity-break pricing. Type
          your quantity on any product page to see the exact rate.
        </p>
      </Container>

      <ProductListing
        products={result.products}
        total={result.total}
        page={result.page}
        pageCount={result.pageCount}
        categories={categories}
        basePath="/products"
        searchParams={searchParams}
      />
    </>
  );
}
