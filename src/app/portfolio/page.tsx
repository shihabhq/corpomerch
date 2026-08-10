import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CalendarDays, ImageIcon } from "lucide-react";

import {
  Breadcrumb,
  ButtonLink,
  Container,
  EmptyState,
  Section,
} from "@/components/ui";
import { getPortfolioItems } from "@/lib/queries";
import { buildMetadata } from "@/lib/seo";
import { assetUrl } from "@/lib/storage";

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: "Portfolio — Events We've Supplied",
  description:
    "Selected work from CorpoMerch: conference badge and lanyard runs, delegate kits, step-and-repeat backdrops, certificates and event print across Bangladesh.",
  path: "/portfolio",
});

export default async function PortfolioPage() {
  const items = await getPortfolioItems();

  return (
    <>
      <Container>
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Portfolio" }]} />
      </Container>

      <Container className="pb-2">
        <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          Work we&apos;ve delivered
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          Career fairs, conferences, convocations and festivals — badge runs,
          delegate kits, backdrops and print produced end to end.
        </p>
      </Container>

      <Section className="pt-6">
        <Container>
          {items.length === 0 ? (
            <EmptyState
              icon={<ImageIcon className="size-10" />}
              title="Portfolio coming soon"
              description="We're putting together case studies from recent events. In the meantime, ask us for references and photographs from work in your sector — we're happy to share them."
              action={<ButtonLink href="/contact">Ask for references</ButtonLink>}
            />
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => {
                const cover = assetUrl(item.coverPath);
                return (
                  <li key={item.id}>
                    <Link
                      href={`/portfolio/${item.slug}`}
                      className="group block overflow-hidden rounded-xl border border-line bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
                    >
                      <div className="relative aspect-square w-full bg-surface">
                        {cover ? (
                          <Image
                            src={cover}
                            alt={item.title}
                            fill
                            sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <span className="flex size-full items-center justify-center text-faint">
                            <ImageIcon className="size-8" aria-hidden />
                          </span>
                        )}
                      </div>
                      <div className="border-t border-line p-4">
                        {item.eventType ? (
                          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-brand">
                            {item.eventType}
                          </p>
                        ) : null}
                        <h2 className="mt-1 text-base font-semibold text-ink transition-colors group-hover:text-brand">
                          {item.title}
                        </h2>
                        {item.client ? (
                          <p className="mt-0.5 text-xs text-muted">{item.client}</p>
                        ) : null}
                        {item.summary ? (
                          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted">
                            {item.summary}
                          </p>
                        ) : null}
                        {item.eventDate ? (
                          <p className="mt-3 flex items-center gap-1.5 text-[11px] text-faint">
                            <CalendarDays className="size-3.5" aria-hidden />
                            {item.eventDate.toLocaleDateString("en-GB", {
                              month: "long",
                              year: "numeric",
                            })}
                          </p>
                        ) : null}
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
