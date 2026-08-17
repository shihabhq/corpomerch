import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowRight, Building2, CalendarDays, Tag } from "lucide-react";

import { PortfolioGallery } from "@/components/portfolio/PortfolioGallery";
import { ProductCard, ProductGrid } from "@/components/shared/ProductCard";
import { JsonLd } from "@/components/shared/JsonLd";
import {
  Breadcrumb,
  ButtonLink,
  Container,
  Section,
  SectionHeader,
} from "@/components/ui";
import { CONTACT, SITE } from "@/data/site";
import { getAllPortfolioSlugs, getPortfolioItem } from "@/lib/queries";
import { absoluteUrl, breadcrumbSchema, buildMetadata } from "@/lib/seo";
import { assetUrl } from "@/lib/storage";
import { toPlainText, truncate } from "@/lib/utils";

export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await getAllPortfolioSlugs();
  return slugs.map(({ slug }) => ({ slug }));
}

export async function generateMetadata(
  props: PageProps<"/portfolio/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const item = await getPortfolioItem(slug);

  if (!item) {
    return { title: "Case study not found", robots: { index: false, follow: true } };
  }

  const images = item.gallery
    .slice(0, 4)
    .map((img) => assetUrl(img.storagePath))
    .filter((url): url is string => Boolean(url));

  return buildMetadata({
    title: item.seoTitle ?? `${item.title} — CorpoMerch Portfolio`,
    description:
      item.seoDescription ??
      truncate(toPlainText(item.summary ?? item.description ?? item.title), 158),
    path: `/portfolio/${item.slug}`,
    images,
  });
}

export default async function PortfolioItemPage(
  props: PageProps<"/portfolio/[slug]">,
) {
  const { slug } = await props.params;
  const item = await getPortfolioItem(slug);
  if (!item) notFound();

  const crumbs = [
    { label: "Home", href: "/" },
    { label: "Portfolio", href: "/portfolio" },
    { label: item.title },
  ];

  const cover = assetUrl(item.coverPath);
  const eventDate = item.eventDate
    ? item.eventDate.toLocaleDateString("en-GB", {
        month: "long",
        year: "numeric",
      })
    : null;

  const facts = [
    { icon: Building2, label: "Client", value: item.client },
    { icon: Tag, label: "Type", value: item.eventType },
    ...(eventDate
      ? [{ icon: CalendarDays, label: "Delivered", value: eventDate }]
      : []),
  ].filter((f) => f.value);

  return (
    <>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "CreativeWork",
            "@id": absoluteUrl(`/portfolio/${item.slug}#work`),
            name: item.title,
            headline: item.title,
            description: toPlainText(item.summary ?? item.description ?? item.title),
            ...(cover ? { image: cover } : {}),
            ...(item.eventDate
              ? { dateCreated: item.eventDate.toISOString().slice(0, 10) }
              : {}),
            creator: { "@id": absoluteUrl("/#organization") },
            ...(item.client
              ? { sourceOrganization: { "@type": "Organization", name: item.client } }
              : {}),
            about: item.products.map((p) => ({
              "@type": "Product",
              name: p.name,
              url: absoluteUrl(`/products/${p.slug}`),
            })),
          },
          breadcrumbSchema(crumbs.map((c) => ({ name: c.label, url: c.href }))),
        ]}
      />

      <Container>
        <Breadcrumb items={crumbs} />
      </Container>

      <Container className="pb-2">
        <div className="max-w-3xl">
          {item.eventType ? (
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand">
              {item.eventType}
            </p>
          ) : null}
          <h1 className="mt-2 text-2xl font-semibold leading-tight tracking-tight text-ink sm:text-3xl lg:text-4xl">
            {item.title}
          </h1>
          {item.summary ? (
            <p className="mt-4 text-base leading-relaxed text-body">
              {item.summary}
            </p>
          ) : null}
        </div>

        {facts.length > 0 ? (
          <dl className="mt-7 flex flex-wrap gap-x-10 gap-y-4 border-t border-line pt-6">
            {facts.map((fact) => (
              <div key={fact.label}>
                <dt className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
                  <fact.icon className="size-3.5 text-brand" aria-hidden />
                  {fact.label}
                </dt>
                <dd className="mt-1 text-sm font-medium text-ink">{fact.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
      </Container>

      {item.gallery.length > 0 ? (
        <Container className="pt-8">
          <PortfolioGallery images={item.gallery} title={item.title} />
        </Container>
      ) : null}

      {item.description ? (
        <Section>
          <Container>
            <div className="cm-prose max-w-3xl text-[15px]">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {item.description}
              </ReactMarkdown>
            </div>
          </Container>
        </Section>
      ) : null}

      {item.products.length > 0 ? (
        <Section muted>
          <Container>
            <SectionHeader
              eyebrow="What we supplied"
              title="Order the same thing"
              description="Everything used on this job, with live bulk pricing."
            />
            <ProductGrid>
              {item.products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </ProductGrid>
          </Container>
        </Section>
      ) : null}

      <Section>
        <Container>
          <div className="flex flex-col items-start gap-5 rounded-xl border border-brand/20 bg-brand-tint p-6 md:flex-row md:items-center md:justify-between md:p-8">
            <div className="max-w-xl">
              <h2 className="text-lg font-semibold tracking-tight text-ink sm:text-xl">
                Running something similar?
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-body">
                Tell us the quantity and your event date. We will come back with a
                firm quote, usually the same working day.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href={`https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(
                  `Hello ${SITE.name}! I saw your ${item.title} work and would like a quote for something similar.`,
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-brand px-5 text-sm font-semibold text-white transition-all hover:bg-brand-dark active:scale-[0.98]"
              >
                Get a quote
                <ArrowRight className="size-4" aria-hidden />
              </a>
              <ButtonLink href="/portfolio" variant="outline">
                More work
              </ButtonLink>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
