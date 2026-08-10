import Link from "next/link";
import { ArrowRight, BadgeCheck, Boxes, Clock4, Wallet } from "lucide-react";

import { CategoryCarousel } from "@/components/home/CategoryCarousel";
import { ClientLogos } from "@/components/home/ClientLogos";
import { Hero } from "@/components/home/Hero";
import { HowItWorks } from "@/components/home/HowItWorks";
import { ProductCard, ProductGrid } from "@/components/shared/ProductCard";
import { JsonLd } from "@/components/shared/JsonLd";
import { ButtonLink, Container, Section, SectionHeader } from "@/components/ui";
import {
  getCategoryShowcase,
  getFaqs,
  getFeaturedProducts,
  listProducts,
} from "@/lib/queries";
import { faqSchema, itemListSchema } from "@/lib/seo";

// Catalogue changes are infrequent and the admin pings /api/revalidate on
// publish, so an hour of staleness is the right trade for a static home page.
export const revalidate = 3600;

const WHY_US = [
  {
    icon: Boxes,
    title: "One supplier, every category",
    body: "Badges, drinkware, print and signage from a single point of contact — no chasing four vendors before an event.",
  },
  {
    icon: Wallet,
    title: "Bulk pricing you can see",
    body: "Quantity-break prices are published on every product page. Type your quantity and the rate updates instantly.",
  },
  {
    icon: Clock4,
    title: "Built around your event date",
    body: "Turnaround is listed per product, from next-day banners to three-week assembled kits. We schedule to your deadline.",
  },
  {
    icon: BadgeCheck,
    title: "Proof before production",
    body: "A digital proof on every job and physical samples on request. Nothing prints until you have signed it off.",
  },
];

export default async function HomePage() {
  const [featured, categoryShowcase, newest, faqs] = await Promise.all([
    getFeaturedProducts(10),
    getCategoryShowcase(),
    listProducts({ sort: "newest", perPage: 5 }),
    getFaqs(),
  ]);

  return (
    <>
      <JsonLd
        data={[
          itemListSchema(featured, "Popular products at CorpoMerch"),
          faqSchema(faqs.slice(0, 6)),
        ]}
      />

      <Hero products={featured} />

      <Section>
        <Container>
          <SectionHeader
            eyebrow="Browse"
            title="What we supply"
            description="Twenty product lines across eleven categories — and if it can be branded and it is not listed here, ask us anyway."
            action={
              <ButtonLink href="/products" variant="outline" size="sm">
                All products
                <ArrowRight className="size-4" aria-hidden />
              </ButtonLink>
            }
          />
          <CategoryCarousel categories={categoryShowcase} />
        </Container>
      </Section>

      <Section muted>
        <Container>
          <SectionHeader
            eyebrow="Best sellers"
            title="Popular right now"
            description="The items event teams order most often, with live bulk pricing."
            action={
              <ButtonLink
                href="/products?sort=featured"
                variant="outline"
                size="sm"
              >
                See all
                <ArrowRight className="size-4" aria-hidden />
              </ButtonLink>
            }
          />
          <ProductGrid>
            {featured.slice(0, 10).map((product, i) => (
              <ProductCard
                key={product.id}
                product={product}
                priority={i < 5}
              />
            ))}
          </ProductGrid>
        </Container>
      </Section>

      <Section muted>
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1fr_1.15fr] lg:gap-14">
            <div>
              <SectionHeader
                eyebrow="Why CorpoMerch"
                title="Built for people running events on a deadline"
              />
              <div className="grid gap-4 sm:grid-cols-2">
                {WHY_US.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-xl border border-line bg-white p-5 shadow-sm"
                  >
                    <item.icon className="size-5 text-brand" aria-hidden />
                    <h3 className="mt-3 text-sm font-semibold text-ink">
                      {item.title}
                    </h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-muted">
                      {item.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <SectionHeader
                eyebrow="Latest additions"
                title="New in the catalogue"
                action={
                  <ButtonLink
                    href="/products?sort=newest"
                    variant="ghost"
                    size="sm"
                  >
                    View all
                    <ArrowRight className="size-4" aria-hidden />
                  </ButtonLink>
                }
              />
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
                {newest.products.slice(0, 3).map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    sizes="(min-width: 1024px) 20vw, 45vw"
                  />
                ))}
              </div>
            </div>
          </div>
        </Container>
      </Section>

      <Section muted className="py-10 md:py-12">
        <Container>
          <SectionHeader
            eyebrow="Trusted by"
            title="Clients and organisations we've supplied"
            description="From university clubs and sports complexes to agencies and event teams — a snapshot of who we've produced merchandise and print for."
            align="center"
          />
          <ClientLogos />
        </Container>
      </Section>

      <Section>
        <Container>
          <SectionHeader
            eyebrow="Questions"
            title="The things people ask first"
            action={
              <ButtonLink href="/faq" variant="outline" size="sm">
                All FAQs
                <ArrowRight className="size-4" aria-hidden />
              </ButtonLink>
            }
          />
          <div className="grid gap-3 md:grid-cols-2">
            {faqs.slice(0, 4).map((faq) => (
              <details
                key={faq.id}
                className="group rounded-xl border border-line bg-white p-5 shadow-sm transition-colors open:border-brand/25"
              >
                <summary className="cursor-pointer list-none text-sm font-semibold text-ink marker:content-none">
                  <span className="flex items-start justify-between gap-4">
                    {faq.question}
                    <span
                      className="mt-0.5 shrink-0 text-brand transition-transform group-open:rotate-45"
                      aria-hidden
                    >
                      +
                    </span>
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>

          <p className="mt-6 text-center text-sm text-muted">
            Something not covered?{" "}
            <Link
              href="/contact"
              className="font-medium text-brand hover:underline"
            >
              Get in touch
            </Link>
            .
          </p>
        </Container>
      </Section>
    </>
  );
}
