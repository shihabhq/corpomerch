"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

import { ButtonLink, Container } from "@/components/ui";
import { CONTACT } from "@/data/site";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[storefront]", error);
  }, [error]);

  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <span className="flex size-14 items-center justify-center rounded-xl bg-warning-tint text-warning">
        <AlertTriangle className="size-7" aria-hidden />
      </span>

      <h1 className="mt-6 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
        Something went wrong
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
        This is on us, not you. Try again — and if it keeps happening, message us
        and we&apos;ll sort your order out directly.
      </p>

      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex h-11 items-center gap-2 rounded-lg bg-brand px-5 text-sm font-medium text-white shadow-sm transition-all hover:bg-brand-dark active:scale-[0.98]"
        >
          <RotateCcw className="size-4" aria-hidden />
          Try again
        </button>
        <ButtonLink href="/" variant="outline">
          Back to home
        </ButtonLink>
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
        {error.digest ? (
          <>
            {" · "}
            <span className="font-mono">ref {error.digest}</span>
          </>
        ) : null}
      </p>
    </Container>
  );
}
