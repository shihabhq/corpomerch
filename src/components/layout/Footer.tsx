import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";

import { CONTACT, FOOTER_SECTIONS, SITE } from "@/data/site";
import { cn, CONTAINER } from "@/lib/utils";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-line bg-white">
      {/* Quote band */}
      <div className="bg-ink">
        <div
          className={cn(
            CONTAINER,
            "flex flex-col items-start gap-5 py-10 md:flex-row md:items-center md:justify-between md:py-12",
          )}
        >
          <div className="max-w-xl">
            <h2 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
              Need a quote for your next event?
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-white/70">
              Send us your quantity and deadline on WhatsApp. We usually reply
              within a couple of hours on working days.
            </p>
          </div>
          <a
            href={`https://wa.me/${CONTACT.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 shrink-0 items-center gap-2.5 rounded-lg bg-[#25D366] px-6 text-sm font-semibold text-white transition-all hover:bg-[#1da851] active:scale-[0.98]"
          >
            <MessageCircle className="size-5" aria-hidden />
            Message us on WhatsApp
          </a>
        </div>
      </div>

      <div className={cn(CONTAINER, "py-12")}>
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          <div className="col-span-2 lg:col-span-2">
            <Image
              src="/assets/logo.png"
              alt="CorpoMerch by Backstage"
              width={256}
              height={144}
              className="h-9 w-auto"
            />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
              Customised corporate merchandise and print for events, offices and
              institutions across Bangladesh — from a single engraved card
              holder to a thousand-piece delegate kit.
            </p>

            <address className="mt-6 space-y-3 not-italic">
              <a
                href={CONTACT.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-2.5 text-sm text-muted transition-colors hover:text-brand"
              >
                <MapPin className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
                <span>
                  {CONTACT.addressLine}
                  <br />
                  {CONTACT.addressCity} {CONTACT.addressPostcode}, {CONTACT.addressCountry}
                </span>
              </a>
              <a
                href={CONTACT.phoneHref}
                className="flex items-center gap-2.5 text-sm text-muted transition-colors hover:text-brand"
              >
                <Phone className="size-4 shrink-0 text-brand" aria-hidden />
                {CONTACT.phoneDisplay}
              </a>
              <a
                href={`mailto:${CONTACT.email}`}
                className="flex items-center gap-2.5 text-sm text-muted transition-colors hover:text-brand"
              >
                <Mail className="size-4 shrink-0 text-brand" aria-hidden />
                {CONTACT.email}
              </a>
            </address>
          </div>

          {FOOTER_SECTIONS.map((section) => (
            <div key={section.title}>
              <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-ink">
                {section.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted transition-colors hover:text-brand"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-line bg-surface">
        <div
          className={cn(
            CONTAINER,
            "flex flex-col items-center justify-between gap-3 py-5 sm:flex-row",
          )}
        >
          <p className="text-xs text-muted">
            © {year} {SITE.name}, a {SITE.legalName} brand. All rights reserved.
          </p>
          <p className="text-xs text-faint">{CONTACT.hours}</p>
        </div>
      </div>
    </footer>
  );
}
