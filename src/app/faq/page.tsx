import type { Metadata } from "next";

import { JsonLd } from "@/components/shared/JsonLd";
import { Breadcrumb, Container, Section } from "@/components/ui";
import { CONTACT } from "@/data/site";
import { getFaqs } from "@/lib/queries";
import { buildMetadata, faqSchema } from "@/lib/seo";

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: "FAQ: Ordering, Artwork, Turnaround & Delivery",
  description:
    "Answers on minimum order quantities, bulk pricing, artwork formats, proofing, production turnaround, nationwide delivery and payment terms at CorpoMerch.",
  path: "/faq",
});

const CATEGORY_LABELS: Record<string, string> = {
  ordering: "Ordering & pricing",
  printing: "Artwork & printing",
  delivery: "Production & delivery",
  payment: "Payment",
};

export default async function FaqPage() {
  const faqs = await getFaqs();

  const grouped = faqs.reduce<Record<string, typeof faqs>>((acc, faq) => {
    const key = faq.category ?? "other";
    (acc[key] ??= []).push(faq);
    return acc;
  }, {});

  return (
    <>
      <JsonLd data={faqSchema(faqs)} />

      <Container>
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "FAQ" }]} />
      </Container>

      <Container className="pb-4">
        <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          Frequently asked questions
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          The things people ask before their first order. If yours is not here,
          message us on WhatsApp, we would rather answer than have you guess.
        </p>
      </Container>

      <Section className="pt-6">
        <Container>
          <div className="max-w-3xl space-y-10">
            {Object.entries(grouped).map(([category, items]) => (
              <div key={category} id={category === "printing" ? "artwork" : category}>
                <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.12em] text-brand">
                  {CATEGORY_LABELS[category] ?? "Other"}
                </h2>
                <div className="space-y-3">
                  {items.map((faq) => (
                    <details
                      key={faq.id}
                      className="group rounded-xl border border-line bg-white p-5 shadow-sm transition-colors open:border-brand/25"
                    >
                      <summary className="cursor-pointer list-none text-sm font-semibold text-ink marker:content-none sm:text-base">
                        <span className="flex items-start justify-between gap-4">
                          {faq.question}
                          <span
                            className="mt-0.5 shrink-0 text-lg leading-none text-brand transition-transform group-open:rotate-45"
                            aria-hidden
                          >
                            +
                          </span>
                        </span>
                      </summary>
                      <p className="mt-3 text-sm leading-relaxed text-body">
                        {faq.answer}
                      </p>
                    </details>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 max-w-3xl rounded-xl border border-brand/20 bg-brand-tint p-6">
            <h2 className="text-base font-semibold text-ink">
              Still have a question?
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-body">
              Message us on WhatsApp at{" "}
              <a
                href={`https://wa.me/${CONTACT.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-brand hover:underline"
              >
                {CONTACT.phoneDisplay}
              </a>{" "}
              or email{" "}
              <a
                href={`mailto:${CONTACT.email}`}
                className="font-medium text-brand hover:underline"
              >
                {CONTACT.email}
              </a>
              .
            </p>
          </div>
        </Container>
      </Section>
    </>
  );
}
