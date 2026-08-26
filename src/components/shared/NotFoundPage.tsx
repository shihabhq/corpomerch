import type { ReactNode } from "react";

import { ButtonLink, Container } from "@/components/ui";
import { CONTACT } from "@/data/site";

export function NotFoundPage({
  icon,
  eyebrow = "404",
  title,
  description,
  actions,
}: {
  icon: ReactNode;
  eyebrow?: string;
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <span className="flex size-14 items-center justify-center rounded-xl bg-brand-tint text-brand">
        {icon}
      </span>

      <p className="mt-6 text-sm font-semibold uppercase tracking-[0.12em] text-brand">
        {eyebrow}
      </p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
        {title}
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
        {description}
      </p>

      <div className="mt-7 flex flex-wrap justify-center gap-3">
        {actions ?? (
          <>
            <ButtonLink href="/products">Browse the catalogue</ButtonLink>
            <ButtonLink href="/" variant="outline">
              Back to home
            </ButtonLink>
          </>
        )}
      </div>

      <p className="mt-6 text-xs text-faint">
        Or WhatsApp us on{" "}
        <a
          href={`https://wa.me/${CONTACT.whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-brand hover:underline"
        >
          {CONTACT.phoneDisplay}
        </a>
      </p>
    </Container>
  );
}
