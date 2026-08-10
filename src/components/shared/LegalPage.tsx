import type { ReactNode } from "react";

import { Breadcrumb, Container, Section } from "@/components/ui";

/**
 * Shared shell for the three legal pages so they cannot drift into three
 * slightly different layouts.
 */
export function LegalPage({
  title,
  intro,
  updated,
  children,
}: {
  title: string;
  intro?: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <>
      <Container>
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: title }]} />
      </Container>

      <Container className="pb-2">
        <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          {title}
        </h1>
        {intro ? (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
            {intro}
          </p>
        ) : null}
        <p className="mt-3 text-xs text-faint">Last updated {updated}</p>
      </Container>

      <Section className="pt-6">
        <Container>
          <div className="cm-prose max-w-3xl text-sm">{children}</div>
        </Container>
      </Section>
    </>
  );
}

export function LegalSection({
  heading,
  children,
}: {
  heading: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-8 first:mt-0">
      <h2 className="text-base font-semibold text-ink">{heading}</h2>
      <div className="mt-2 space-y-3">{children}</div>
    </section>
  );
}
