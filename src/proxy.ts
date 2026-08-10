import { NextResponse, type NextRequest } from "next/server";

/**
 * Next 16 renamed `middleware.ts` to `proxy.ts` and the exported function to
 * `proxy`. Runtime is Node.js and is not configurable.
 *
 * This exists for one job: canonicalising product and category slugs to
 * lowercase with a real HTTP 308.
 *
 * It cannot live in the page. A page with a `loading.tsx` starts streaming
 * immediately, so the 200 shell is already on the wire by the time
 * `permanentRedirect()` throws — the browser follows it client-side, but
 * crawlers see 200 at two URLs for one product and index both. Doing it here,
 * before rendering, produces a genuine redirect.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const match = pathname.match(/^\/(products|categories)\/([^/]+)$/);
  if (!match) return NextResponse.next();

  const [, segment, rawSlug] = match;
  const slug = decodeURIComponent(rawSlug);
  const lower = slug.toLowerCase();

  if (slug === lower) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = `/${segment}/${encodeURIComponent(lower)}`;
  return NextResponse.redirect(url, 308);
}

export const config = {
  matcher: ["/products/:slug", "/categories/:slug"],
};
