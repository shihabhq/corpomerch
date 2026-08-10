"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";

import { cn } from "@/lib/utils";
import type { CategoryTreeDTO } from "@/types/catalog";

/**
 * All listing state lives in the URL, so a filtered view is shareable,
 * back-button-correct and indexable. Nothing here holds filter state in React
 * beyond the mobile sheet's open/closed flag.
 */

const SORTS = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "name", label: "Name A–Z" },
  { value: "newest", label: "Newest" },
] as const;

const UNITS = [
  { value: "PC", label: "Per piece" },
  { value: "SQFT", label: "Per sq.ft." },
  { value: "SET", label: "Per set" },
] as const;

const PRICE_BANDS = [
  { value: "0-25", label: "Under ৳25" },
  { value: "25-100", label: "৳25 – ৳100" },
  { value: "100-300", label: "৳100 – ৳300" },
  { value: "300-", label: "৳300 and up" },
] as const;

const MOQ_BANDS = [
  { value: "20", label: "20 or fewer" },
  { value: "50", label: "50 or fewer" },
  { value: "100", label: "100 or fewer" },
] as const;

function useParamWriter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "") params.delete(key);
        else params.set(key, value);
      }
      // Any filter change invalidates the current page number.
      if (!("page" in updates)) params.delete("page");
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname, searchParams],
  );
}

export function SortSelect() {
  const searchParams = useSearchParams();
  const write = useParamWriter();
  const current = searchParams.get("sort") ?? "featured";

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="hidden text-muted sm:inline">Sort</span>
      <select
        value={current}
        onChange={(e) => write({ sort: e.target.value })}
        className="h-10 rounded-lg border border-line bg-white px-3 pr-8 text-sm font-medium text-ink outline-none transition-colors hover:border-line-strong focus:border-brand/40 focus:ring-2 focus:ring-brand/15"
      >
        {SORTS.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function FilterGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-line py-5 first:pt-0 last:border-0">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.08em] text-ink">
        {title}
      </h3>
      {children}
    </div>
  );
}

function RadioRow({
  checked,
  label,
  count,
  onSelect,
}: {
  checked: boolean;
  label: string;
  count?: number;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-sm transition-colors",
        checked ? "bg-brand-tint font-medium text-brand" : "text-body hover:bg-surface",
      )}
    >
      <span
        className={cn(
          "flex size-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
          checked ? "border-brand" : "border-line-strong",
        )}
        aria-hidden
      >
        {checked ? <span className="size-2 rounded-full bg-brand" /> : null}
      </span>
      <span className="flex-1">{label}</span>
      {count !== undefined ? (
        <span className="text-xs tabular-nums text-faint">{count}</span>
      ) : null}
    </button>
  );
}

export function FilterPanel({
  categories,
  lockedCategory,
}: {
  categories: CategoryTreeDTO[];
  /** Set on a category page — that facet is fixed and hidden. */
  lockedCategory?: string;
}) {
  const searchParams = useSearchParams();
  const write = useParamWriter();

  const unit = searchParams.get("unit");
  const price = searchParams.get("price");
  const moq = searchParams.get("moq");
  const variants = searchParams.get("variants");

  const activeCount = [unit, price, moq, variants].filter(Boolean).length;

  return (
    <div>
      {activeCount > 0 ? (
        <div className="mb-4 flex items-center justify-between">
          <span className="text-xs text-muted">
            {activeCount} filter{activeCount === 1 ? "" : "s"} active
          </span>
          <button
            type="button"
            onClick={() =>
              write({ unit: null, price: null, moq: null, variants: null })
            }
            className="text-xs font-medium text-brand hover:underline"
          >
            Clear all
          </button>
        </div>
      ) : null}

      {!lockedCategory ? (
        <FilterGroup title="Category">
          <ul className="space-y-0.5">
            {categories.map((cat) => (
              <li key={cat.id}>
                <Link
                  href={`/categories/${cat.slug}`}
                  className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm text-body transition-colors hover:bg-surface hover:text-ink"
                >
                  {cat.name}
                  <span className="text-xs tabular-nums text-faint">
                    {cat.productCount}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </FilterGroup>
      ) : null}

      <FilterGroup title="Priced by">
        <div className="space-y-0.5">
          <RadioRow
            checked={!unit}
            label="Any"
            onSelect={() => write({ unit: null })}
          />
          {UNITS.map((u) => (
            <RadioRow
              key={u.value}
              checked={unit === u.value}
              label={u.label}
              onSelect={() => write({ unit: unit === u.value ? null : u.value })}
            />
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Starting price">
        <div className="space-y-0.5">
          <RadioRow
            checked={!price}
            label="Any"
            onSelect={() => write({ price: null })}
          />
          {PRICE_BANDS.map((b) => (
            <RadioRow
              key={b.value}
              checked={price === b.value}
              label={b.label}
              onSelect={() => write({ price: price === b.value ? null : b.value })}
            />
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Minimum order">
        <div className="space-y-0.5">
          <RadioRow
            checked={!moq}
            label="Any"
            onSelect={() => write({ moq: null })}
          />
          {MOQ_BANDS.map((b) => (
            <RadioRow
              key={b.value}
              checked={moq === b.value}
              label={b.label}
              onSelect={() => write({ moq: moq === b.value ? null : b.value })}
            />
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Options">
        <label className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm text-body transition-colors hover:bg-surface">
          <input
            type="checkbox"
            checked={variants === "1"}
            onChange={(e) => write({ variants: e.target.checked ? "1" : null })}
            className="size-4 rounded border-line-strong accent-brand"
          />
          Has variants to choose from
        </label>
      </FilterGroup>
    </div>
  );
}

/** Same panel, in a bottom sheet, for small screens. */
export function MobileFilters({
  categories,
  lockedCategory,
  resultCount,
}: {
  categories: CategoryTreeDTO[];
  lockedCategory?: string;
  resultCount: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-10 items-center gap-2 rounded-lg border border-line bg-white px-3.5 text-sm font-medium text-ink transition-colors hover:border-line-strong lg:hidden"
      >
        <SlidersHorizontal className="size-4" aria-hidden />
        Filters
      </button>

      {open ? (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <button
            type="button"
            className="absolute inset-0 animate-fade-in bg-black/40"
            onClick={() => setOpen(false)}
            aria-label="Close filters"
          />
          <div className="absolute inset-x-0 bottom-0 flex max-h-[85vh] flex-col rounded-t-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <h2 className="text-base font-semibold text-ink">Filters</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-2 text-ink hover:bg-surface"
                aria-label="Close filters"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4">
              <FilterPanel categories={categories} lockedCategory={lockedCategory} />
            </div>

            <div className="border-t border-line p-4">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="h-11 w-full rounded-lg bg-brand text-sm font-semibold text-white"
              >
                Show {resultCount} product{resultCount === 1 ? "" : "s"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
