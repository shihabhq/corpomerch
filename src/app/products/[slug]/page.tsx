import { Fragment } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { ProductConfigurator } from "@/components/product/ProductConfigurator";
import { ProductCard, ProductGrid } from "@/components/shared/ProductCard";
import { JsonLd } from "@/components/shared/JsonLd";
import { Breadcrumb, Container, Section, SectionHeader } from "@/components/ui";
import {
  getAllProductSlugs,
  getProductDetail,
  getRelatedProducts,
} from "@/lib/queries";
import { breadcrumbSchema, buildMetadata, productSchema } from "@/lib/seo";
import { formatBDT, formatQty, toPlainText, truncate, unitLabel } from "@/lib/utils";
import type { ProductDetailDTO, SpecRow } from "@/types/catalog";

export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await getAllProductSlugs();
  return slugs.map(({ slug }) => ({ slug }));
}

/** Both metadata and the page need this; Next dedupes the call within a render. */
async function load(slugParam: string) {
  const slug = slugParam.toLowerCase();
  return { slug, product: await getProductDetail(slug) };
}

export async function generateMetadata(
  props: PageProps<"/products/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const { product } = await load(slug);

  if (!product) {
    return { title: "Product not found", robots: { index: false, follow: true } };
  }

  const priceLine =
    product.minUnitPrice !== null
      ? ` from ${formatBDT(product.minUnitPrice)} per ${unitLabel(product.unit, 1, product.unitLabel)}`
      : "";
  const moqLine = product.effectiveMoq
    ? ` MOQ ${formatQty(product.effectiveMoq, product.unit, product.unitLabel)}.`
    : "";

  const description =
    product.seoDescription ??
    truncate(
      `${toPlainText(product.shortDescription ?? product.description ?? product.name)}${priceLine ? ` Available${priceLine}.` : ""}${moqLine}`,
      158,
    );

  const images = [
    ...product.sharedImages,
    ...product.options.flatMap((o) => o.values.flatMap((v) => v.images)),
  ]
    .slice(0, 4)
    .map((img) => img.url);

  return {
    ...buildMetadata({
      title: product.seoTitle ?? `${product.name}: Custom Printing & Bulk Pricing`,
      description,
      path: `/products/${product.slug}`,
      images,
    }),
    other: {
      ...(product.minUnitPrice !== null
        ? {
            "product:price:amount": String(product.minUnitPrice),
            "product:price:currency": product.currency,
          }
        : {}),
      "product:availability": "in stock",
      "product:condition": "new",
      "product:brand": "CorpoMerch",
      ...(product.categories.find((c) => c.isPrimary)
        ? { "product:category": product.categories.find((c) => c.isPrimary)!.name }
        : {}),
    },
  };
}

/**
 * Map ?material=wood&width=20mm onto { optionId: optionValueId }, falling back
 * to each axis's default value. Rendering the selected variant server-side is
 * what makes a configured link crawlable.
 */
function resolveSelection(
  product: ProductDetailDTO,
  searchParams: Record<string, string | string[] | undefined>,
): Record<string, string> {
  const selection: Record<string, string> = {};

  for (const option of product.options) {
    const raw = searchParams[option.paramKey];
    const code = Array.isArray(raw) ? raw[0] : raw;

    const match = code
      ? option.values.find((v) => v.valueCode.toLowerCase() === code.toLowerCase())
      : undefined;

    const chosen =
      match ?? option.values.find((v) => v.isDefault) ?? option.values[0];

    if (chosen) selection[option.id] = chosen.id;
  }

  return selection;
}

function SpecTable({ specs }: { specs: SpecRow[] }) {
  // Preserve the authored order; group headings are just runs of the same
  // `group` value, which is why specs is an array and not an object.
  const groups: { name: string | null; rows: SpecRow[] }[] = [];
  for (const row of specs) {
    const name = row.group ?? null;
    const last = groups.at(-1);
    if (last && last.name === name) last.rows.push(row);
    else groups.push({ name, rows: [row] });
  }

  return (
    <div className="overflow-hidden rounded-xl border border-line">
      <table className="w-full text-sm">
        <tbody>
          {groups.map((group, gi) => (
            <Fragment key={`group-${gi}`}>
              {group.name ? (
                <tr className="bg-surface">
                  <th
                    colSpan={2}
                    scope="colgroup"
                    className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-[0.08em] text-brand"
                  >
                    {group.name}
                  </th>
                </tr>
              ) : null}
              {group.rows.map((row, ri) => (
                <tr
                  key={`${gi}-${ri}`}
                  className="border-t border-line align-top"
                >
                  <th
                    scope="row"
                    className="w-2/5 px-4 py-3 text-left font-medium text-muted sm:w-1/3"
                  >
                    {row.key}
                  </th>
                  <td className="px-4 py-3 text-ink">{row.value}</td>
                </tr>
              ))}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function ProductPage(props: PageProps<"/products/[slug]">) {
  const { slug: rawSlug } = await props.params;
  const searchParams = await props.searchParams;

  // Slug casing is canonicalised to lowercase by src/proxy.ts, which can
  // issue a real 308 — a redirect thrown from here would arrive after the
  // streamed 200 shell and crawlers would index both casings.

  const { product } = await load(rawSlug);
  if (!product) notFound();

  const primary = product.categories.find((c) => c.isPrimary) ?? product.categories[0];
  const related = await getRelatedProducts(
    product.id,
    product.categories.map((c) => c.slug),
  );

  const selection = resolveSelection(product, searchParams);

  const allImages = [
    ...product.sharedImages,
    ...product.options.flatMap((o) => o.values.flatMap((v) => v.images)),
  ].map((i) => i.url);

  const crumbs = [
    { label: "Home", href: "/" },
    { label: "Products", href: "/products" },
    ...(primary?.parentSlug && primary.parentName
      ? [{ label: primary.parentName, href: `/categories/${primary.parentSlug}` }]
      : []),
    ...(primary ? [{ label: primary.name, href: `/categories/${primary.slug}` }] : []),
    { label: product.name },
  ];

  return (
    <>
      <JsonLd
        data={[
          productSchema(product, allImages),
          breadcrumbSchema(
            crumbs.map((c) => ({ name: c.label, url: c.href })),
          ),
        ]}
      />

      <Container>
        <Breadcrumb items={crumbs} />
      </Container>

      <Container className="pb-12">
        <ProductConfigurator product={product} initialSelection={selection} />
      </Container>

      {(product.specs.length > 0 || product.description) ? (
        <Section muted>
          <Container>
            <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
              {product.specs.length > 0 ? (
                <div>
                  <h2 className="mb-4 text-lg font-semibold tracking-tight text-ink sm:text-xl">
                    Specifications
                  </h2>
                  <SpecTable specs={product.specs} />
                </div>
              ) : null}

              {product.description ? (
                <div>
                  <h2 className="mb-4 text-lg font-semibold tracking-tight text-ink sm:text-xl">
                    About this product
                  </h2>
                  <div className="cm-prose rounded-xl border border-line bg-white p-5 text-sm sm:p-6">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {product.description}
                    </ReactMarkdown>
                  </div>
                </div>
              ) : null}
            </div>

            {product.tags.length > 0 ? (
              <ul className="mt-8 flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <li key={tag}>
                    <a
                      href={`/search?q=${encodeURIComponent(tag)}`}
                      className="inline-block rounded-full border border-line bg-white px-3 py-1 text-xs text-muted transition-colors hover:border-brand/30 hover:text-brand"
                    >
                      {tag}
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </Container>
        </Section>
      ) : null}

      {related.length > 0 ? (
        <Section>
          <Container>
            <SectionHeader
              eyebrow="You might also need"
              title="Goes well with this"
              description={`Other items event teams order alongside ${product.name.toLowerCase()}.`}
            />
            <ProductGrid>
              {related.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </ProductGrid>
          </Container>
        </Section>
      ) : null}
    </>
  );
}

export const dynamicParams = true;
