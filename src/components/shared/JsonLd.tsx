/**
 * Emits structured data. Kept in one component so the script tag is always
 * shaped correctly and every page's JSON-LD is serialised the same way.
 *
 * The payload is always built server-side from our own database rows via
 * src/lib/seo.ts — no user input reaches it.
 */
export function JsonLd({
  data,
}: {
  data: Record<string, unknown> | Record<string, unknown>[];
}) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
