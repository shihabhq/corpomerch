"use client";

import { useEffect } from "react";

/**
 * Last-resort boundary: catches failures in the root layout itself — which is
 * a real possibility here, because the layout queries the database for the
 * category nav and site settings on every request. `error.tsx` sits *inside*
 * the layout and so cannot catch those.
 *
 * It REPLACES the root layout, so it renders its own <html>/<body> and cannot
 * assume the fonts or Tailwind theme loaded. Inline styles, no imports.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[storefront:global]", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#fff",
          color: "#3f3f46",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, sans-serif",
        }}
      >
        <div style={{ maxWidth: "28rem", padding: "2rem", textAlign: "center" }}>
          <h1
            style={{
              margin: 0,
              fontSize: "1.5rem",
              fontWeight: 600,
              color: "#0a0a0a",
              letterSpacing: "-0.01em",
            }}
          >
            Something went wrong
          </h1>
          <p style={{ marginTop: "0.75rem", fontSize: "0.9375rem", lineHeight: 1.7 }}>
            Our site is having a moment. Please try again — and if you need
            something urgently, message us on WhatsApp and we&apos;ll sort it out
            directly.
          </p>

          <div
            style={{
              marginTop: "1.75rem",
              display: "flex",
              gap: "0.75rem",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              onClick={reset}
              style={{
                height: "2.75rem",
                padding: "0 1.5rem",
                background: "#d12429",
                color: "#fff",
                border: 0,
                borderRadius: "0.5rem",
                fontSize: "0.875rem",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Try again
            </button>
            <a
              href="https://wa.me/8801612170202"
              style={{
                height: "2.75rem",
                padding: "0 1.5rem",
                display: "inline-flex",
                alignItems: "center",
                background: "#25D366",
                color: "#fff",
                borderRadius: "0.5rem",
                fontSize: "0.875rem",
                fontWeight: 500,
                textDecoration: "none",
              }}
            >
              Message us on WhatsApp
            </a>
          </div>

          <p style={{ marginTop: "1.5rem", fontSize: "0.8125rem", color: "#71717a" }}>
            +880 1612-170202
          </p>
          {error.digest ? (
            <p
              style={{
                marginTop: "0.5rem",
                fontSize: "0.6875rem",
                color: "#a1a1aa",
                fontFamily: "ui-monospace, SFMono-Regular, monospace",
              }}
            >
              ref {error.digest}
            </p>
          ) : null}
        </div>
      </body>
    </html>
  );
}
