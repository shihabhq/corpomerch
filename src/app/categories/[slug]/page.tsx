import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  parseListingParams,
  ProductListing,
} from "@/components/product/ProductListing";
import { JsonLd } from "@/components/shared/JsonLd";
import { Breadcrumb, Container } from "@/components/ui";
import {
  getAllCategorySlugs,
  getCategory,
  getCategoryTree,
  listProducts,
} from "@/lib/queries";
import { breadcrumbSchema, buildMetadata, itemListSchema } from "@/lib/seo";

export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await getAllCategorySlugs();
  return slugs.map(({ slug }) => ({ slug }));
}

export async function generateMetadata(
  props: PageProps<"/categories/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const category = await getCategory(slug);

  if (!category) {
    return { title: "Category not found", robots: { index: false, follow: true } };
  }

  return buildMetadata({
    title:
      category.seoTitle ??
      `${category.name}: Custom Printing & Bulk Pricing in Bangladesh`,
    description:
      category.seoDescription ??
      category.description ??
      `Browse ${category.name.toLowerCase()} from CorpoMerch. Customised, bulk priced and delivered across Bangladesh.`,
    path: `/categories/${category.slug}`,
  });
}

export default async function CategoryPage(
  props: PageProps<"/categories/[slug]">,
) {
  const { slug } = await props.params;
  const searchParams = await props.searchParams;
  const params = parseListingParams(searchParams);

  const category = await getCategory(slug);
  if (!category) notFound();

  const [result, categories] = await Promise.all([
    listProducts({ ...params, categorySlug: slug }),
    getCategoryTree(),
  ]);

  const crumbs = [
    { label: "Home", href: "/" },
    { label: "Products", href: "/products" },
    ...(category.parent
      ? [{ label: category.parent.name, href: `/categories/${category.parent.slug}` }]
      : []),
    { label: category.name },
  ];

  return (
    <>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: category.name,
            description: category.description ?? undefined,
            mainEntity: itemListSchema(result.products, category.name),
          },
          breadcrumbSchema(crumbs.map((c) => ({ name: c.label, url: c.href }))),
        ]}
      />

      <Container>
        <Breadcrumb items={crumbs} />
      </Container>

      <Container className="pb-2">
        <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          {category.name}
        </h1>
        {category.description ? (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
            {category.description}
          </p>
        ) : null}

        {category.children.length > 0 ? (
          <ul className="mt-5 flex flex-wrap gap-2">
            {category.children.map((child) => (
              <li key={child.slug}>
                <Link
                  href={`/categories/${child.slug}`}
                  className="inline-flex items-center rounded-full border border-line bg-white px-3.5 py-1.5 text-sm font-medium text-body transition-colors hover:border-brand/30 hover:text-brand"
                >
                  {child.name}
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </Container>

      <ProductListing
        products={result.products}
        total={result.total}
        page={result.page}
        pageCount={result.pageCount}
        categories={categories}
        lockedCategory={slug}
        basePath={`/categories/${slug}`}
        searchParams={searchParams}
        emptyTitle={`Nothing in ${category.name} matches those filters`}
      />
    </>
  );
}
