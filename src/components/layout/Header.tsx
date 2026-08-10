"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  Menu,
  MessageCircle,
  Phone,
  Search,
  ShoppingBag,
  X,
} from "lucide-react";

import { CONTACT, NAV_LINKS } from "@/data/site";
import { useCartCount } from "@/store/cart";
import { cn, CONTAINER } from "@/lib/utils";
import type { CategoryTreeDTO } from "@/types/catalog";

export function Header({
  categories,
  announcement,
}: {
  categories: CategoryTreeDTO[];
  announcement?: string | null;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const cartCount = useCartCount();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [query, setQuery] = useState("");
  const megaTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Close everything on navigation.
  useEffect(() => {
    setDrawerOpen(false);
    setMegaOpen(false);
  }, [pathname]);

  // Lock body scroll behind the mobile drawer.
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (q) router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  // Small delay on close so the pointer can cross the gap into the panel.
  function openMega() {
    if (megaTimer.current) clearTimeout(megaTimer.current);
    setMegaOpen(true);
  }
  function closeMega() {
    if (megaTimer.current) clearTimeout(megaTimer.current);
    megaTimer.current = setTimeout(() => setMegaOpen(false), 120);
  }

  return (
    <>
      {announcement ? (
        <div className="bg-ink text-white">
          <div className={cn(CONTAINER, "flex items-center justify-center gap-2 py-2 text-center")}>
            <MessageCircle className="hidden size-3.5 shrink-0 text-brand-light sm:block" aria-hidden />
            <p className="text-[11px] font-medium sm:text-xs">{announcement}</p>
          </div>
        </div>
      ) : null}

      <header className="sticky top-0 z-50 border-b border-line bg-white/95 backdrop-blur-md">
        {/* Row 1 — logo, search, actions */}
        <div className={cn(CONTAINER, "flex h-16 items-center gap-3 sm:h-[72px] sm:gap-5")}>
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="-ml-1 rounded-lg p-2 text-ink transition-colors hover:bg-surface ml:hidden"
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </button>

          <Link href="/" className="flex shrink-0 items-center gap-2" aria-label="CorpoMerch home">
            <Image
              src="/assets/logo.png"
              alt="CorpoMerch by Backstage"
              width={256}
              height={144}
              priority
              className="h-11 w-auto sm:h-14"
            />
          </Link>

          <form
            onSubmit={submitSearch}
            role="search"
            className="ml-auto hidden max-w-xl flex-1 sm:block ml:ml-6"
          >
            <div className="flex items-center rounded-lg border border-line bg-surface transition-all focus-within:border-brand/40 focus-within:bg-white focus-within:ring-2 focus-within:ring-brand/15">
              <Search className="ml-3 size-4 shrink-0 text-faint" aria-hidden />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search ID cards, banners, mugs…"
                aria-label="Search products"
                className="h-10 w-full bg-transparent px-2.5 text-sm text-ink outline-none placeholder:text-faint"
              />
              <button
                type="submit"
                className="m-1 rounded-md bg-brand px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-brand-dark"
              >
                Search
              </button>
            </div>
          </form>

          <div className="ml-auto flex items-center gap-1 sm:ml-0">
            <a
              href={CONTACT.phoneHref}
              className="hidden items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-body transition-colors hover:bg-surface hover:text-ink lg:flex"
            >
              <Phone className="size-4 text-brand" aria-hidden />
              {CONTACT.phoneDisplay}
            </a>

            <Link
              href="/cart"
              className="relative rounded-lg p-2.5 text-ink transition-colors hover:bg-surface"
              aria-label={`Inquiry list${cartCount ? `, ${cartCount} items` : ""}`}
            >
              <ShoppingBag className="size-5" />
              {cartCount > 0 ? (
                <span className="absolute right-0.5 top-0.5 flex size-4 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-white">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              ) : null}
            </Link>
          </div>
        </div>

        {/* Row 2 — category bar (desktop) */}
        <div className="hidden border-t border-line ml:block">
          <div className={cn(CONTAINER, "flex items-center gap-1")}>
            <div className="relative" onMouseEnter={openMega} onMouseLeave={closeMega}>
              <button
                type="button"
                onClick={() => setMegaOpen((v) => !v)}
                aria-expanded={megaOpen}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-3 text-sm font-semibold transition-colors",
                  megaOpen ? "text-brand" : "text-ink hover:text-brand",
                )}
              >
                All Categories
                <ChevronDown
                  className={cn("size-4 transition-transform", megaOpen && "rotate-180")}
                  aria-hidden
                />
              </button>

              {megaOpen ? (
                <div className="absolute left-0 top-full z-50 w-[min(64rem,calc(100vw-3rem))] animate-fade-in rounded-b-xl border border-t-0 border-line bg-white p-6 shadow-xl">
                  <div className="grid grid-cols-2 gap-x-8 gap-y-6 lg:grid-cols-4">
                    {categories.map((cat) => (
                      <div key={cat.id}>
                        <Link
                          href={`/categories/${cat.slug}`}
                          className="text-sm font-semibold text-ink transition-colors hover:text-brand"
                        >
                          {cat.name}
                        </Link>
                        <p className="mt-0.5 text-[11px] text-faint">
                          {cat.productCount} product{cat.productCount === 1 ? "" : "s"}
                        </p>
                        {cat.children.length > 0 ? (
                          <ul className="mt-2.5 space-y-1.5">
                            {cat.children.map((child) => (
                              <li key={child.id}>
                                <Link
                                  href={`/categories/${child.slug}`}
                                  className="text-[13px] text-muted transition-colors hover:text-brand"
                                >
                                  {child.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <span className="mx-1 h-5 w-px bg-line" aria-hidden />

            {NAV_LINKS.map((link) => {
              const active =
                pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "group relative px-3 py-3 text-sm font-medium transition-colors",
                    active ? "text-brand" : "text-body hover:text-ink",
                  )}
                >
                  {link.label}
                  <span
                    className={cn(
                      "absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-brand transition-transform duration-200",
                      active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100",
                    )}
                    aria-hidden
                  />
                </Link>
              );
            })}

            <a
              href={`https://wa.me/${CONTACT.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto flex items-center gap-2 py-3 text-sm font-semibold text-brand transition-colors hover:text-brand-dark"
            >
              <MessageCircle className="size-4" aria-hidden />
              Get a quote on WhatsApp
            </a>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {drawerOpen ? (
        <div className="fixed inset-0 z-[60] ml:hidden">
          <button
            type="button"
            className="absolute inset-0 animate-fade-in bg-black/40"
            onClick={() => setDrawerOpen(false)}
            aria-label="Close menu"
          />
          <div className="absolute inset-y-0 left-0 flex w-[85vw] max-w-xs flex-col bg-white shadow-2xl">
            <div className="flex h-16 items-center justify-between border-b border-line px-4">
              <Image
                src="/assets/logo.png"
                alt="CorpoMerch"
                width={256}
                height={144}
                className="h-10 w-auto"
              />
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="rounded-lg p-2 text-ink hover:bg-surface"
                aria-label="Close menu"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-5">
              <form onSubmit={submitSearch} role="search" className="mb-6">
                <div className="flex items-center rounded-lg border border-line bg-surface focus-within:border-brand/40 focus-within:bg-white">
                  <Search className="ml-3 size-4 text-faint" aria-hidden />
                  <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search products…"
                    aria-label="Search products"
                    className="h-10 w-full bg-transparent px-2.5 text-sm outline-none placeholder:text-faint"
                  />
                </div>
              </form>

              <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-faint">
                Categories
              </p>
              <ul className="mb-6 space-y-0.5">
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <Link
                      href={`/categories/${cat.slug}`}
                      className="block rounded-lg px-3 py-2.5 text-sm font-medium text-ink hover:bg-surface"
                    >
                      {cat.name}
                    </Link>
                    {cat.children.length > 0 ? (
                      <ul className="ml-3 border-l border-line pl-3">
                        {cat.children.map((child) => (
                          <li key={child.id}>
                            <Link
                              href={`/categories/${child.slug}`}
                              className="block rounded-lg px-3 py-2 text-[13px] text-muted hover:bg-surface hover:text-ink"
                            >
                              {child.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </li>
                ))}
              </ul>

              <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-faint">
                Menu
              </p>
              <ul className="space-y-0.5">
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="block rounded-lg px-3 py-2.5 text-sm font-medium text-ink hover:bg-surface"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-line p-4">
              <a
                href={`https://wa.me/${CONTACT.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#25D366] text-sm font-semibold text-white"
              >
                <MessageCircle className="size-4" aria-hidden />
                Chat on WhatsApp
              </a>
              <a
                href={CONTACT.phoneHref}
                className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-line text-sm font-medium text-ink"
              >
                <Phone className="size-4 text-brand" aria-hidden />
                {CONTACT.phoneDisplay}
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
