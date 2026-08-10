import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

/**
 * Publish webhook, called by the admin panel after a product or category
 * changes. Without it, an edit waits out the hour-long ISR window.
 *
 * Auth is a shared secret in the Authorization header — this endpoint only
 * busts caches, so it needs to be unforgeable, not user-aware.
 */
export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) {
    return NextResponse.json(
      { ok: false, error: "REVALIDATE_SECRET is not configured" },
      { status: 500 },
    );
  }

  const provided = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (provided !== secret) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let body: { paths?: string[] } = {};
  try {
    body = await request.json();
  } catch {
    // An empty body means "revalidate the defaults".
  }

  const paths =
    body.paths?.length ? body.paths : ["/", "/products", "/sitemap.xml"];

  for (const path of paths) {
    revalidatePath(path);
  }

  return NextResponse.json({ ok: true, revalidated: paths, at: Date.now() });
}
