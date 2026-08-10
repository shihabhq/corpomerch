"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import {
  AlertTriangle,
  Loader2,
  MessageCircle,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { sendInquiry } from "@/app/actions/inquiry";
import { QuantityInput } from "@/components/product/QuantityInput";
import { ButtonLink, EmptyState } from "@/components/ui";
import { money, resolvePrice } from "@/lib/pricing";
import type { PricingModeLike, UnitKindLike } from "@/lib/pricing";
import { PLACEHOLDER_IMAGE } from "@/lib/storage";
import { cn, formatBDT, formatQty } from "@/lib/utils";
import { useCartStore } from "@/store/cart";

export interface CartPricingEntry {
  skuId: string;
  priceOnRequest: boolean;
  moq: number | null;
  priceTiers: { minQty: number; unitPrice: number }[];
  product: {
    id: string;
    slug: string;
    name: string;
    unit: UnitKindLike;
    unitLabel: string | null;
    qtyStep: number;
    moq: number | null;
    pricingMode: PricingModeLike;
  };
}

export type CartPricingSource = Record<string, CartPricingEntry>;

export function CartView({ pricing }: { pricing: CartPricingSource }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const lines = useCartStore((s) => s.lines);
  const hydrated = useCartStore((s) => s.hydrated);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const setNote = useCartStore((s) => s.setNote);
  const remove = useCartStore((s) => s.remove);
  const clear = useCartStore((s) => s.clear);

  const [contact, setContact] = useState({ name: "", company: "", phone: "" });

  /**
   * Prices are recomputed here on every render from server-supplied tier data —
   * never read back from localStorage. A price the admin edited yesterday shows
   * correctly in a cart saved last week.
   */
  const rows = useMemo(
    () =>
      lines.map((line) => {
        const entry = pricing[line.skuId];
        if (!entry) return { line, entry: null, priced: null };

        const priced = resolvePrice({
          product: {
            pricingMode: entry.product.pricingMode,
            moq: entry.product.moq,
            qtyStep: entry.product.qtyStep,
            unit: entry.product.unit,
          },
          sku: {
            id: entry.skuId,
            priceOnRequest: entry.priceOnRequest,
            moq: entry.moq,
            priceTiers: entry.priceTiers,
          },
          quantity: line.quantity,
        });

        return { line, entry, priced };
      }),
    [lines, pricing],
  );

  const total = useMemo(
    () => money(rows.reduce((sum, r) => sum + (r.priced?.lineTotal ?? 0), 0)),
    [rows],
  );
  const anyOnRequest = rows.some((r) => r.priced?.isPriceOnRequest ?? true);
  const staleRows = rows.filter((r) => !r.entry);

  function handleSend() {
    startTransition(async () => {
      try {
        const result = await sendInquiry({
          source: "CART",
          items: rows
            .filter((r) => r.entry)
            .map((r) => ({
              productId: r.entry!.product.id,
              skuId: r.line.skuId,
              quantity: r.line.quantity,
              note: r.line.note,
            })),
          contact: {
            name: contact.name || undefined,
            company: contact.company || undefined,
            phone: contact.phone || undefined,
          },
        });
        window.open(result.whatsappUrl, "_blank", "noopener,noreferrer");
      } catch {
        toast.error("Could not open WhatsApp", {
          description: "Please try again, or call us on +880 1612-170202.",
        });
      }
    });
  }

  // Render nothing product-specific until localStorage has been read, or the
  // server and client markup disagree and React logs a hydration error.
  if (!hydrated) {
    return (
      <div className="grid gap-4 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-3">
          {[0, 1].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-surface-alt" />
          ))}
        </div>
        <div className="h-64 animate-pulse rounded-xl bg-surface-alt" />
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <EmptyState
        icon={<ShoppingBag className="size-10" />}
        title="Your inquiry list is empty"
        description="Add products as you browse and send them to us in one message. Nothing is charged and no account is needed."
        action={
          <ButtonLink href="/products">Browse the catalogue</ButtonLink>
        }
      />
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_22rem] lg:items-start">
      <div className="space-y-3">
        {rows.map(({ line, entry, priced }) => (
          <article
            key={line.key}
            className={cn(
              "flex gap-4 rounded-xl border border-line bg-white p-4",
              !entry && "border-warning/30 bg-warning-tint",
            )}
          >
            <Link
              href={`/products/${line.productSlug}${line.optionQuery}`}
              className="relative size-20 shrink-0 overflow-hidden rounded-lg border border-line bg-white sm:size-24"
            >
              <Image
                src={line.imageUrl ?? PLACEHOLDER_IMAGE}
                alt={line.productName}
                fill
                sizes="96px"
                className="object-contain p-1.5"
              />
            </Link>

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate text-sm font-semibold text-ink sm:text-base">
                    <Link
                      href={`/products/${line.productSlug}${line.optionQuery}`}
                      className="hover:text-brand"
                    >
                      {line.productName}
                    </Link>
                  </h2>
                  {line.optionLabels.length > 0 ? (
                    <p className="mt-0.5 text-xs text-muted">
                      {line.optionLabels
                        .map((o) => `${o.option}: ${o.value}`)
                        .join(" · ")}
                    </p>
                  ) : null}
                </div>

                <button
                  type="button"
                  onClick={() => remove(line.key)}
                  className="shrink-0 rounded-lg p-1.5 text-faint transition-colors hover:bg-surface hover:text-brand"
                  aria-label={`Remove ${line.productName}`}
                >
                  <Trash2 className="size-4" />
                </button>
              </div>

              {!entry ? (
                <p className="mt-2 flex items-start gap-1.5 text-xs text-warning">
                  <AlertTriangle className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                  This item is no longer available. Remove it to continue.
                </p>
              ) : (
                <>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    <div className="w-44">
                      <QuantityInput
                        value={line.quantity}
                        onChange={(q) => setQuantity(line.key, q)}
                        qtyStep={entry.product.qtyStep}
                        unit={entry.product.unit}
                        unitLabelOverride={entry.product.unitLabel}
                      />
                    </div>

                    <div className="text-right">
                      {priced?.isPriceOnRequest ? (
                        <p className="text-sm font-semibold text-ink">
                          Price on request
                        </p>
                      ) : (
                        <>
                          <p className="text-base font-semibold tabular-nums text-ink">
                            {formatBDT(priced?.lineTotal)}
                          </p>
                          <p className="text-xs tabular-nums text-muted">
                            {formatBDT(priced?.unitPrice)} each
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  {priced?.belowMoq ? (
                    <p className="mt-2 text-xs text-warning">
                      Below the{" "}
                      {formatQty(
                        priced.moq,
                        entry.product.unit,
                        entry.product.unitLabel,
                      )}{" "}
                      minimum — we&apos;ll confirm when we quote.
                    </p>
                  ) : null}

                  <input
                    type="text"
                    value={line.note ?? ""}
                    onChange={(e) => setNote(line.key, e.target.value)}
                    placeholder="Add a note for this item (optional)"
                    className="mt-2.5 w-full rounded-lg border border-line bg-surface px-3 py-2 text-xs text-ink outline-none transition-colors placeholder:text-faint focus:border-brand/40 focus:bg-white focus:ring-2 focus:ring-brand/15"
                  />
                </>
              )}
            </div>
          </article>
        ))}

        <div className="flex justify-between pt-1">
          <ButtonLink href="/products" variant="ghost" size="sm">
            Continue browsing
          </ButtonLink>
          <button
            type="button"
            onClick={() => {
              clear();
              toast.success("List cleared");
            }}
            className="text-xs font-medium text-muted transition-colors hover:text-brand"
          >
            Clear list
          </button>
        </div>
      </div>

      {/* Summary */}
      <aside className="rounded-xl border border-line bg-white p-5 shadow-sm lg:sticky lg:top-32">
        <h2 className="text-base font-semibold text-ink">Send your inquiry</h2>

        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted">Items</dt>
            <dd className="tabular-nums text-ink">{lines.length}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">
              Estimated total
              {anyOnRequest ? (
                <span className="block text-xs text-faint">priced items only</span>
              ) : null}
            </dt>
            <dd className="text-lg font-semibold tabular-nums text-brand">
              {total > 0 ? formatBDT(total) : "—"}
            </dd>
          </div>
        </dl>

        <p className="mt-3 rounded-lg bg-surface px-3 py-2.5 text-xs leading-relaxed text-muted">
          An estimate from published bulk rates. Delivery, artwork and any
          special finishing are confirmed in the final quote.
        </p>

        <div className="mt-5 space-y-2.5">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted">
            Your details <span className="font-normal normal-case tracking-normal text-faint">(optional)</span>
          </p>
          {(
            [
              { key: "name", placeholder: "Your name" },
              { key: "company", placeholder: "Company or organisation" },
              { key: "phone", placeholder: "Phone number" },
            ] as const
          ).map((field) => (
            <input
              key={field.key}
              type="text"
              value={contact[field.key]}
              onChange={(e) =>
                setContact((c) => ({ ...c, [field.key]: e.target.value }))
              }
              placeholder={field.placeholder}
              className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-faint focus:border-brand/40 focus:ring-2 focus:ring-brand/15"
            />
          ))}
        </div>

        <button
          type="button"
          onClick={handleSend}
          disabled={pending || staleRows.length > 0}
          className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2.5 rounded-lg bg-brand text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-dark hover:shadow-md active:scale-[0.98] disabled:opacity-60"
        >
          {pending ? (
            <Loader2 className="size-5 animate-spin" aria-hidden />
          ) : (
            <MessageCircle className="size-5" aria-hidden />
          )}
          {pending ? "Opening WhatsApp…" : "Send inquiry on WhatsApp"}
        </button>

        {staleRows.length > 0 ? (
          <p className="mt-2 text-center text-xs text-warning">
            Remove the unavailable item{staleRows.length === 1 ? "" : "s"} first.
          </p>
        ) : (
          <p className="mt-2 text-center text-xs text-faint">
            No payment, no account. This just starts a conversation.
          </p>
        )}
      </aside>
    </div>
  );
}
