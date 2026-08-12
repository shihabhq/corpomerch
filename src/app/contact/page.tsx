import type { Metadata } from "next";
import { Clock4, Mail, MapPin, MessageCircle, Phone } from "lucide-react";

import { JsonLd } from "@/components/shared/JsonLd";
import { Breadcrumb, Container, Section } from "@/components/ui";
import { CONTACT } from "@/data/site";
import { breadcrumbSchema, buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Contact CorpoMerch, Panthapath, Dhaka",
  description: `Get a quote for custom corporate merchandise and print. WhatsApp ${CONTACT.phoneDisplay}, email ${CONTACT.email}, or visit us at Concept Tower, Greenroad, Panthapath, Dhaka 1205.`,
  path: "/contact",
});

const CHANNELS = [
  {
    icon: MessageCircle,
    label: "WhatsApp",
    value: CONTACT.phoneDisplay,
    href: `https://wa.me/${CONTACT.whatsapp}`,
    hint: "Fastest, usually answered within a couple of hours",
    external: true,
    accent: true,
  },
  {
    icon: Phone,
    label: "Phone",
    value: CONTACT.phoneDisplay,
    href: CONTACT.phoneHref,
    hint: "During business hours",
  },
  {
    icon: Mail,
    label: "Email",
    value: CONTACT.email,
    href: `mailto:${CONTACT.email}`,
    hint: "For purchase orders and formal quotes",
  },
];

export default function ContactPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Contact", url: "/contact" },
        ])}
      />

      <Container>
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Contact" }]} />
      </Container>

      <Container className="pb-4">
        <div className="max-w-2xl">
          <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            Get in touch
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Tell us what you need, how many, and when you need it by. That is
            usually enough for us to come back with a firm price the same day.
          </p>
        </div>
      </Container>

      <Section className="pt-6">
        <Container>
          <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
            <div className="space-y-3">
              {CHANNELS.map((channel) => (
                <a
                  key={channel.label}
                  href={channel.href}
                  {...(channel.external
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                  className="group flex items-start gap-4 rounded-xl border border-line bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-lg active:scale-[0.99]"
                >
                  <span
                    className={
                      channel.accent
                        ? "flex size-11 shrink-0 items-center justify-center rounded-lg bg-[#25D366]/10 text-[#1da851]"
                        : "flex size-11 shrink-0 items-center justify-center rounded-lg bg-brand-tint text-brand"
                    }
                  >
                    <channel.icon className="size-5" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted">
                      {channel.label}
                    </p>
                    <p className="mt-0.5 truncate text-base font-semibold text-ink transition-colors group-hover:text-brand">
                      {channel.value}
                    </p>
                    <p className="mt-0.5 text-xs text-faint">{channel.hint}</p>
                  </div>
                </a>
              ))}

              <div className="rounded-xl border border-line bg-white p-5 shadow-sm">
                <span className="flex size-11 items-center justify-center rounded-lg bg-brand-tint text-brand">
                  <Clock4 className="size-5" aria-hidden />
                </span>
                <p className="mt-3 text-xs font-semibold uppercase tracking-[0.08em] text-muted">
                  Business hours
                </p>
                <p className="mt-0.5 text-sm font-medium text-ink">
                  {CONTACT.hours}
                </p>
                <p className="mt-1 text-xs text-faint">
                  Friday closed. Urgent event deadlines: message on WhatsApp any
                  time and we will pick it up.
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-line bg-white p-6 shadow-sm">
              <span className="flex size-11 items-center justify-center rounded-lg bg-brand-tint text-brand">
                <MapPin className="size-5" aria-hidden />
              </span>
              <h2 className="mt-4 text-lg font-semibold tracking-tight text-ink">
                Visit the office
              </h2>
              <address className="mt-2 text-sm not-italic leading-relaxed text-body">
                {CONTACT.addressLine}
                <br />
                {CONTACT.addressCity} {CONTACT.addressPostcode},{" "}
                {CONTACT.addressCountry}
              </address>

              <a
                href={CONTACT.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex h-10 items-center gap-2 rounded-lg border border-line-strong bg-white px-4 text-sm font-medium text-ink transition-colors hover:border-ink hover:bg-surface"
              >
                <MapPin className="size-4 text-brand" aria-hidden />
                Open in Google Maps
              </a>

              <div className="mt-6 rounded-lg bg-surface p-4">
                <h3 className="text-sm font-semibold text-ink">
                  What to include in your first message
                </h3>
                <ul className="mt-2.5 space-y-1.5 text-sm text-body">
                  {[
                    "What you need (or a link to the product page)",
                    "Quantity, or a rough range",
                    "The date you need it delivered by",
                    "Whether artwork is ready, or you need design",
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

              <a
                href={`https://wa.me/${CONTACT.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2.5 rounded-lg bg-[#25D366] text-sm font-semibold text-white transition-all hover:bg-[#1da851] active:scale-[0.98]"
              >
                <MessageCircle className="size-5" aria-hidden />
                Start a WhatsApp chat
              </a>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
