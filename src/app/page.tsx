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
    body: "Badges, drinkware, print and signage from a single point of contact, no chasing four vendors before an event.",
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
            description="Twenty product lines across eleven categories, and if it can be branded and it is not listed here, ask us anyway."
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

      <Section muted className="py-10 md:py-12">
        <Container>
          <SectionHeader
            eyebrow="Trusted by"
            title="Clients and organisations we've supplied"
            description="From university clubs and sports complexes to agencies and event teams: a snapshot of who we've produced merchandise and print for."
            align="center"
          />
          <ClientLogos />
        </Container>
      </Section>
    </>
  );
}
