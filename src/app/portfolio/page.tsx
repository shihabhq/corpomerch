import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, ImageIcon, Images } from "lucide-react";

import { JsonLd } from "@/components/shared/JsonLd";
import {
  Breadcrumb,
  ButtonLink,
  Container,
  EmptyState,
  Section,
} from "@/components/ui";
import { getPortfolioItems } from "@/lib/queries";
import { absoluteUrl, buildMetadata } from "@/lib/seo";
import { assetUrl } from "@/lib/storage";

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: "Portfolio: Events We've Supplied",
  description:
    "Selected work from CorpoMerch: numbered event ticket booklets, PVC crew badges, campaign vouchers, delegate kits and event print produced across Bangladesh.",
  path: "/portfolio",
});

export default async function PortfolioPage() {
  const items = await getPortfolioItems();

  return (
    <>
      {items.length > 0 ? (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "CorpoMerch Portfolio",
            mainEntity: {
              "@type": "ItemList",
              numberOfItems: items.length,
              itemListElement: items.map((item, i) => ({
                "@type": "ListItem",
                position: i + 1,
                name: item.title,
                url: absoluteUrl(`/portfolio/${item.slug}`),
              })),
            },
          }}
        />
      ) : null}

      <Container>
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Portfolio" }]} />
      </Container>

      <Container className="pb-2">
        <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          Work we&apos;ve delivered
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          Brand activations, concerts, career fairs and conferences: ticket
          booklets, crew badges, vouchers and event print produced end to end.
        </p>
      </Container>

      <Section className="pt-6">
        <Container>
          {items.length === 0 ? (
            <EmptyState
              icon={<ImageIcon className="size-10" />}
              title="Portfolio coming soon"
              description="We're putting together case studies from recent events. In the meantime, ask us for references and photographs from work in your sector, we're happy to share them."
              action={<ButtonLink href="/contact">Ask for references</ButtonLink>}
            />
          ) : (
            <ul className="grid gap-5 md:grid-cols-2">
              {items.map((item, i) => {
                const cover = assetUrl(item.coverPath);
                return (
                  <li key={item.id}>
                    <Link
                      href={`/portfolio/${item.slug}`}
                      className="group flex h-full flex-col overflow-hidden rounded-xl border border-line bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:border-line-strong hover:shadow-lg active:scale-[0.99]"
                    >
                      <div className="relative aspect-[16/10] w-full overflow-hidden bg-ink">
                        {cover ? (
                          <Image
                            src={cover}
                            alt={item.gallery[0]?.alt ?? item.title}
                            fill
                            sizes="(min-width: 768px) 50vw, 100vw"
                            priority={i < 2}
                            placeholder={
                              item.gallery[0]?.blurDataUrl ? "blur" : "empty"
                            }
                            blurDataURL={item.gallery[0]?.blurDataUrl}
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <span className="flex size-full items-center justify-center text-white/30">
                            <ImageIcon className="size-8" aria-hidden />
                          </span>
                        )}

                        {item.imageCount > 1 ? (
                          <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
                            <Images className="size-3" aria-hidden />
                            {item.imageCount}
                          </span>
                        ) : null}
                      </div>

                      <div className="flex flex-1 flex-col border-t border-line p-5">
                        {item.eventType ? (
                          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-brand">
                            {item.eventType}
                          </p>
                        ) : null}

                        <h2 className="mt-1.5 text-base font-semibold leading-snug text-ink transition-colors group-hover:text-brand sm:text-lg">
                          {item.title}
                        </h2>

                        {item.client ? (
                          <p className="mt-1 text-xs font-medium text-muted">
                            {item.client}
                          </p>
                        ) : null}

                        {item.summary ? (
                          <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted">
                            {item.summary}
                          </p>
                        ) : null}

                        <div className="mt-auto flex items-center justify-between pt-4">
                          {item.eventDate ? (
                            <span className="flex items-center gap-1.5 text-[11px] text-faint">
                              <CalendarDays className="size-3.5" aria-hidden />
                              {item.eventDate.toLocaleDateString("en-GB", {
                                month: "long",
                                year: "numeric",
                              })}
                            </span>
                          ) : (
                            <span />
                          )}
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand">
                            Read the case study
                            <ArrowRight
                              className="size-3.5 transition-transform group-hover:translate-x-0.5"
                              aria-hidden
                            />
                          </span>
                        </div>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Container>
      </Section>
    </>
  );
}
