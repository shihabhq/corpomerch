"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";

import {
  ListingPageSkeleton,
  NavigationOverlay,
  NavigationProgressBar,
  ProductPageSkeleton,
} from "@/components/shared/Loader";
import { useNavigationStore } from "@/store/navigation";

function navigationLabel(target: string | null): string {
  if (!target) return "Loading page…";
  if (target.startsWith("/products/")) return "Loading product…";
  if (target.startsWith("/categories/")) return "Loading category…";
  if (target.startsWith("/portfolio/")) return "Loading case study…";
  if (target.startsWith("/search")) return "Searching catalogue…";
  return "Loading page…";
}

function NavigationSkeleton({ target }: { target: string | null }) {
  if (target?.startsWith("/products/")) return <ProductPageSkeleton />;
  if (
    target?.startsWith("/products") ||
    target?.startsWith("/categories/") ||
    target?.startsWith("/search")
  ) {
    return <ListingPageSkeleton />;
  }
  return null;
}

function NavigationLoaderInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pending = useNavigationStore((s) => s.pending);
  const target = useNavigationStore((s) => s.target);
  const stop = useNavigationStore((s) => s.stop);
  const start = useNavigationStore((s) => s.start);

  const [visible, setVisible] = useState(false);
  const showTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear navigation state once the URL has updated.
  useEffect(() => {
    stop();
  }, [pathname, searchParams, stop]);

  // Debounce the overlay so fast prefetched navigations never flash. Hiding
  // still goes through a (0ms) timeout rather than a synchronous setState so
  // this effect never triggers a cascading render.
  useEffect(() => {
    if (showTimer.current) clearTimeout(showTimer.current);

    showTimer.current = setTimeout(() => setVisible(pending), pending ? 120 : 0);
    return () => {
      if (showTimer.current) clearTimeout(showTimer.current);
    };
  }, [pending]);

  // Intercept same-origin link clicks. We cannot put loading.tsx above
  // products/[slug] or categories/[slug] without turning real 404s into
  // soft 200s (see CLAUDE.md), so client-side feedback covers those routes.
  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (event.defaultPrevented) return;
      if (event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const anchor = (event.target as HTMLElement | null)?.closest("a");
      if (!anchor) return;
      if (anchor.target === "_blank") return;
      if (anchor.hasAttribute("download")) return;

      const href = anchor.getAttribute("href");
      if (
        !href ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:")
      ) {
        return;
      }

      const url = new URL(href, window.location.href);
      if (url.origin !== window.location.origin) return;

      const next = `${url.pathname}${url.search}`;
      const current = `${pathname}${searchParams.size ? `?${searchParams.toString()}` : ""}`;
      if (next === current) return;

      start(next);
    }

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [pathname, searchParams, start]);

  const skeleton = visible ? <NavigationSkeleton target={target} /> : null;

  return (
    <>
      <NavigationProgressBar visible={visible} />
      <NavigationOverlay visible={visible} label={navigationLabel(target)} />
      {skeleton ? (
        <div
          aria-hidden
          className="pointer-events-none fixed inset-x-0 top-16 z-80 max-h-[calc(100dvh-4rem)] overflow-hidden opacity-35"
        >
          {skeleton}
        </div>
      ) : null}
    </>
  );
}

export function NavigationLoader() {
  return (
    <Suspense fallback={null}>
      <NavigationLoaderInner />
    </Suspense>
  );
}
