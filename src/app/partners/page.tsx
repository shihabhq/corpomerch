import type { Metadata } from "next";
import Image from "next/image";
import { Handshake } from "lucide-react";

import {
  Breadcrumb,
  ButtonLink,
  Container,
  EmptyState,
  Section,
} from "@/components/ui";
import { getPartners } from "@/lib/queries";
import { buildMetadata } from "@/lib/seo";
import { assetUrl } from "@/lib/storage";

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: "Our Partners & Clients",
  description:
    "Organisations CorpoMerch supplies with customised merchandise, print and event kits across Bangladesh.",
  path: "/partners",
});

export default async function PartnersPage() {
  const partners = await getPartners();

  return (
    <>
      <Container>
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Partners" }]} />
      </Container>

      <Container className="pb-2">
        <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          Partners &amp; clients
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          Universities, banks, agencies and event organisers we produce for.
        </p>
      </Container>

      <Section className="pt-6">
        <Container>
          {partners.length === 0 ? (
            <EmptyState
              icon={<Handshake className="size-10" />}
              title="Client list coming soon"
              description="We're confirming which client logos we're able to display publicly. Ask us directly and we'll gladly share references and examples from work in your sector."
              action={<ButtonLink href="/contact">Request references</ButtonLink>}
            />
          ) : (
            <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {partners.map((partner) => {
                const logo = assetUrl(partner.logoPath);
                const inner = (
                  <div className="flex aspect-[3/2] items-center justify-center rounded-xl border border-line bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg">
                    {logo ? (
                      <Image
                        src={logo}
                        alt={partner.name}
                        width={200}
                        height={100}
                        className="max-h-full w-auto object-contain opacity-80 transition-opacity hover:opacity-100"
                      />
                    ) : (
                      <span className="text-center text-sm font-medium text-muted">
                        {partner.name}
                      </span>
                    )}
                  </div>
                );

                return (
                  <li key={partner.id}>
                    {partner.website ? (
                      <a
                        href={partner.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={partner.name}
                      >
                        {inner}
                      </a>
                    ) : (
                      inner
                    )}
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
