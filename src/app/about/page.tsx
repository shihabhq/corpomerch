import type { Metadata } from "next";
import { ArrowRight, Boxes, MapPin, Palette, Truck } from "lucide-react";

import { HowItWorks } from "@/components/home/HowItWorks";
import {
  Breadcrumb,
  ButtonLink,
  Container,
  Section,
  SectionHeader,
} from "@/components/ui";
import { CONTACT, SITE, TRUST_STATS } from "@/data/site";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "About CorpoMerch — Corporate Merchandise Supplier in Dhaka",
  description:
    "CorpoMerch by Backstage is a Dhaka-based supplier of customised corporate merchandise and print — one point of contact for badges, drinkware, print, signage and complete event kits.",
  path: "/about",
});

const CAPABILITIES = [
  {
    icon: Palette,
    title: "Design and pre-press",
    body: "In-house design for certificates, badge layouts, banner artwork and full kit branding. Send a logo and a brief; we send back a mock-up.",
  },
  {
    icon: Boxes,
    title: "Sourcing and production",
    body: "Print, laser cutting, engraving, sublimation and large-format across a vetted supplier network — so one purchase order covers the whole event.",
  },
  {
    icon: Truck,
    title: "Assembly and delivery",
    body: "Kits packed, collated in registration order where needed, and delivered to your office or straight to the venue anywhere in Bangladesh.",
  },
];

export default function AboutPage() {
  return (
    <>
      <Container>
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "About" }]} />
      </Container>

      <Container className="pb-4">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand">
            About us
          </p>
          <h1 className="mt-3 text-2xl font-semibold leading-tight tracking-tight text-ink sm:text-4xl">
            One supplier for everything your event hands out.
          </h1>
          <p className="mt-5 text-base leading-relaxed text-body">
            {SITE.name} is the corporate merchandise arm of {SITE.legalName}. We
            exist because organising an event should not mean managing five
            vendors — one for badges, one for lanyards, one for the banner, one
            for the delegate bags, and one who does not answer the phone in the
            final week.
          </p>
          <p className="mt-4 text-base leading-relaxed text-body">
            We supply all of it, branded to one artwork, quoted on one sheet and
            delivered on one date. From a single laser-engraved card holder to a
            thousand-piece conference kit with the backdrop wall to match.
          </p>
        </div>

        <dl className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {TRUST_STATS.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-line bg-white p-5 shadow-sm"
            >
              <dt className="sr-only">{stat.label}</dt>
              <dd>
                <span className="block text-2xl font-semibold tabular-nums text-brand">
                  {stat.value}
                </span>
                <span className="mt-1 block text-xs text-muted">{stat.label}</span>
              </dd>
            </div>
          ))}
        </dl>
      </Container>

      <Section muted>
        <Container>
          <SectionHeader
            eyebrow="What we do"
            title="Three things, done properly"
          />
          <div className="grid gap-4 md:grid-cols-3">
            {CAPABILITIES.map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-line bg-white p-6 shadow-sm"
              >
                <span className="flex size-11 items-center justify-center rounded-lg bg-brand-tint text-brand">
                  <item.icon className="size-5" aria-hidden />
                </span>
                <h3 className="mt-4 text-base font-semibold text-ink">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <SectionHeader
            eyebrow="How we work"
            title="No forms, no accounts, no chasing"
            description="Everything runs through WhatsApp on purpose. It is where our clients already are, and it means a question at 9pm the night before an event actually gets answered."
          />
          <HowItWorks />
        </Container>
      </Section>

      <Section muted>
        <Container>
          <div className="grid items-center gap-8 rounded-xl border border-line bg-white p-6 shadow-sm md:grid-cols-2 md:p-10">
            <div>
              <span className="flex size-11 items-center justify-center rounded-lg bg-brand-tint text-brand">
                <MapPin className="size-5" aria-hidden />
              </span>
              <h2 className="mt-4 text-xl font-semibold tracking-tight text-ink">
                Find us in Panthapath
              </h2>
              <address className="mt-3 text-sm not-italic leading-relaxed text-body">
                {CONTACT.addressLine}
                <br />
                {CONTACT.addressCity} {CONTACT.addressPostcode},{" "}
                {CONTACT.addressCountry}
              </address>
              <p className="mt-3 text-sm text-muted">{CONTACT.hours}</p>

              <div className="mt-6 flex flex-wrap gap-3">
                <ButtonLink href="/contact">
                  Contact us
                  <ArrowRight className="size-4" aria-hidden />
                </ButtonLink>
                <ButtonLink href="/products" variant="outline">
                  Browse products
                </ButtonLink>
              </div>
            </div>

            <div className="rounded-xl bg-surface p-6">
              <h3 className="text-sm font-semibold text-ink">
                Who we typically work with
              </h3>
              <ul className="mt-3 space-y-2 text-sm text-body">
                {[
                  "University clubs and career fairs",
                  "Corporate conferences and AGMs",
                  "Banks, insurers and NGOs",
                  "Concerts, festivals and expos",
                  "HR teams running onboarding at scale",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <span
                      className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand"
                      aria-hidden
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
