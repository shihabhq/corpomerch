"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import {
  AlertTriangle,
  Check,
  Clock4,
  Loader2,
  MessageCircle,
  Package,
  ShoppingBag,
} from "lucide-react";
import { toast } from "sonner";

import { sendInquiry } from "@/app/actions/inquiry";
import { ProductGallery } from "@/components/product/ProductGallery";
import { QuantityInput, SqftCalculator } from "@/components/product/QuantityInput";
import { TierTable } from "@/components/product/TierTable";
import { VariantSelector } from "@/components/product/VariantSelector";
import { Badge } from "@/components/ui";
import { buildTierRanges, resolvePrice } from "@/lib/pricing";
import { cn, formatBDT, formatQty, unitLabel } from "@/lib/utils";
import { lineKey, useCartStore } from "@/store/cart";
import type { ProductDetailDTO } from "@/types/catalog";

/**
 * Owns the whole PDP right column plus the gallery, because selecting an
 * axis-1 value has to change both at once.
 *
 * Selection lives in the URL query string (?material=wood&width=20mm) so a
 * configured spec is linkable, shareable and crawlable. The server component
 * reads the same params to render the correct initial state.
 */
export function ProductConfigurator({
  product,
  initialSelection,
}: {
  product: ProductDetailDTO;
  /** optionId -> optionValueId, resolved server-side from searchParams. */
  initialSelection: Record<string, string>;
}) {
  const router = useRouter();
  const addToCart = useCartStore((s) => s.add);
  const [pending, startTransition] = useTransition();

  const [selection, setSelection] = useState(initialSelection);
  const [note, setNote] = useState<string>("");
  const [added, setAdded] = useState(false);

  // ── Resolve the active SKU from the selection ──
  const activeSku = useMemo(() => {
    if (product.options.length === 0) {
      return product.skus.find((s) => s.isDefault) ?? product.skus[0] ?? null;
    }
    return (
      product.skus.find((sku) =>
        product.options.every(
          (opt) => sku.optionValueIds[opt.id] === selection[opt.id],
        ),
      ) ?? null
    );
  }, [product.options, product.skus, selection]);

  const startQty = useMemo(() => {
    const moq =
      activeSku?.moq ??
      product.moq ??
      activeSku?.priceTiers[0]?.minQty ??
      product.qtyStep;
    return Math.max(product.qtyStep, moq);
  }, [activeSku, product.moq, product.qtyStep]);

  const [quantity, setQuantity] = useState(startQty);

  // Changing variant can change the MOQ (wooden keyring 20 vs acrylic 50).
  // Only lift the quantity, never silently drop what the user typed.
  useEffect(() => {
    setQuantity((q) => (q < startQty ? startQty : q));
  }, [startQty]);

  const priced = useMemo(
    () =>
      resolvePrice({
        product: {
          pricingMode: product.pricingMode,
          moq: product.moq,
          qtyStep: product.qtyStep,
          unit: product.unit,
        },
        sku: activeSku,
        quantity,
      }),
    [product, activeSku, quantity],
  );

  const tierRanges = useMemo(
    () => buildTierRanges(activeSku?.priceTiers ?? [], product.qtyStep),
    [activeSku, product.qtyStep],
  );

  // ── Gallery: axis-1 images for the selected value, then shared ──
  const axis1 = product.options.find((o) => o.position === 1);
  const galleryImages = useMemo(() => {
    if (axis1) {
      const valueId = selection[axis1.id];
      const scoped = axis1.values.find((v) => v.id === valueId)?.images ?? [];
      if (scoped.length > 0) return [...scoped, ...product.sharedImages];
    }
    return product.sharedImages;
  }, [axis1, selection, product.sharedImages]);

  // ── URL sync ──
  const optionQuery = useMemo(() => {
    const params = new URLSearchParams();
    for (const opt of product.options) {
      const value = opt.values.find((v) => v.id === selection[opt.id]);
      if (value) params.set(opt.paramKey, value.valueCode);
    }
    const s = params.toString();
    return s ? `?${s}` : "";
  }, [product.options, selection]);

  useEffect(() => {
    if (!optionQuery) return;
    router.replace(`/products/${product.slug}${optionQuery}`, { scroll: false });
  }, [optionQuery, product.slug, router]);

  const handleSelect = useCallback((optionId: string, valueId: string) => {
    setSelection((prev) => ({ ...prev, [optionId]: valueId }));
    setAdded(false);
  }, []);

  // Values that would leave no active SKU, given everything else selected.
  const unavailable = useMemo(() => {
    const off = new Set<string>();
    for (const opt of product.options) {
      for (const value of opt.values) {
        const candidate = { ...selection, [opt.id]: value.id };
        const exists = product.skus.some((sku) =>
          product.options.every((o) => sku.optionValueIds[o.id] === candidate[o.id]),
        );
        if (!exists) off.add(value.id);
      }
    }
    return off;
  }, [product.options, product.skus, selection]);

  const optionLabels = useMemo(
    () =>
      product.options
        .map((opt) => ({
          option: opt.name,
          value: opt.values.find((v) => v.id === selection[opt.id])?.label ?? "",
        }))
        .filter((o) => o.value),
    [product.options, selection],
  );

  // ── Actions ──
  function handleAddToCart() {
    if (!activeSku) return;
    addToCart({
      productId: product.id,
      productSlug: product.slug,
      productName: product.name,
      skuId: activeSku.id,
      optionLabels,
      optionQuery,
      imageUrl: galleryImages[0]?.url ?? null,
      unit: product.unit,
      unitLabel: product.unitLabel,
      qtyStep: product.qtyStep,
      quantity,
      note: note || undefined,
      addedAt: 0,
    } as Parameters<typeof addToCart>[0]);

    setAdded(true);
    toast.success("Added to your inquiry list", {
      description: `${product.name} — ${formatQty(quantity, product.unit, product.unitLabel)}`,
      action: { label: "View list", onClick: () => router.push("/cart") },
    });
  }

  function handleInquiry() {
    if (!activeSku) return;
    startTransition(async () => {
      try {
        const result = await sendInquiry({
          source: "PRODUCT",
          items: [
            {
              productId: product.id,
              skuId: activeSku.id,
              quantity,
              note: note || undefined,
            },
          ],
        });
        window.open(result.whatsappUrl, "_blank", "noopener,noreferrer");
      } catch {
        toast.error("Could not open WhatsApp", {
          description: "Please try again, or call us on +880 1612-170202.",
        });
      }
    });
  }

  const isSqft = product.unit === "SQFT";
  const lead =
    product.leadTimeDaysMin && product.leadTimeDaysMax
      ? product.leadTimeDaysMin === product.leadTimeDaysMax
        ? `${product.leadTimeDaysMin} working days`
        : `${product.leadTimeDaysMin}–${product.leadTimeDaysMax} working days`
      : null;

  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
      <div className="lg:sticky lg:top-28 lg:self-start">
        <ProductGallery
          images={galleryImages}
          productName={product.name}
          crossFade={product.swapsOnAxis1}
        />
      </div>

      <div className="pb-24 md:pb-0">
        {/* Title block */}
        <div className="flex flex-wrap items-center gap-2">
          {product.badgeText ? <Badge>{product.badgeText}</Badge> : null}
          {lead ? (
            <span className="inline-flex items-center gap-1.5 text-xs text-muted">
              <Clock4 className="size-3.5" aria-hidden />
              Ready in {lead}
            </span>
          ) : null}
        </div>

        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          {product.name}
        </h1>
        {product.subtitle ? (
          <p className="mt-1 text-sm font-medium text-brand">{product.subtitle}</p>
        ) : null}
        {product.shortDescription ? (
          <p className="mt-3 text-sm leading-relaxed text-body">
            {product.shortDescription}
          </p>
        ) : null}

        {/* Headline price */}
        <div className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          {priced.isPriceOnRequest ? (
            <span className="text-2xl font-semibold text-ink">Price on request</span>
          ) : (
            <>
              <span className="text-3xl font-semibold tabular-nums text-brand">
                {formatBDT(priced.unitPrice)}
              </span>
              <span className="text-sm text-muted">
                per {unitLabel(product.unit, 1, product.unitLabel)}
              </span>
            </>
          )}
          {priced.moq ? (
            <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1 text-xs font-medium text-muted">
              <Package className="size-3.5" aria-hidden />
              MOQ {formatQty(priced.moq, product.unit, product.unitLabel)}
            </span>
          ) : null}
        </div>

        {/* Variants */}
        {product.options.length > 0 ? (
          <div className="mt-6">
            <VariantSelector
              options={product.options}
              selection={selection}
              onSelect={handleSelect}
              unavailable={unavailable}
            />
          </div>
        ) : null}

        {/* Pricing */}
        <div className="mt-6">
          {priced.isPriceOnRequest ? (
            <div className="rounded-xl border border-brand/20 bg-brand-tint p-5">
              <h2 className="text-sm font-semibold text-ink">
                This one is quoted, not listed
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-body">
                The price depends on the specification — size, materials,
                finishing and quantity all move it. Send us what you need and
                we&apos;ll come back with an exact figure, usually the same day.
              </p>
            </div>
          ) : (
            <>
              <h2 className="mb-2.5 text-xs font-semibold uppercase tracking-[0.08em] text-muted">
                Bulk pricing
              </h2>
              <TierTable
                tiers={tierRanges}
                activeIndex={priced.tierIndex}
                unit={product.unit}
                unitLabel={product.unitLabel}
                onPick={(minQty) => setQuantity(Math.max(minQty, product.qtyStep))}
              />
            </>
          )}
        </div>

        {/* Quantity */}
        <div className="mt-5 space-y-3">
          {isSqft ? (
            <SqftCalculator
              onApply={(sqft, description) => {
                setQuantity(Math.max(sqft, product.qtyStep));
                setNote(`Size: ${description}`);
              }}
            />
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="sm:w-52">
              <QuantityInput
                value={quantity}
                onChange={(q) => {
                  setQuantity(q);
                  setAdded(false);
                }}
                qtyStep={product.qtyStep}
                unit={product.unit}
                unitLabelOverride={product.unitLabel}
              />
            </div>

            {!priced.isPriceOnRequest && priced.lineTotal !== null ? (
              <p className="text-sm text-muted">
                <span className="tabular-nums">
                  {formatQty(quantity, product.unit, product.unitLabel)}
                </span>{" "}
                × {formatBDT(priced.unitPrice)} ={" "}
                <span className="text-lg font-semibold tabular-nums text-ink">
                  {formatBDT(priced.lineTotal)}
                </span>
              </p>
            ) : null}
          </div>

          {priced.belowMoq ? (
            <p className="flex items-start gap-2 rounded-lg border border-warning/25 bg-warning-tint px-3 py-2.5 text-xs text-warning">
              <AlertTriangle className="mt-0.5 size-3.5 shrink-0" aria-hidden />
              <span>
                Below the {formatQty(priced.moq, product.unit, product.unitLabel)}{" "}
                minimum. Send the inquiry anyway — we can often make smaller runs
                work, especially alongside other items.
              </span>
            </p>
          ) : priced.belowLowestTier ? (
            <p className="flex items-start gap-2 rounded-lg border border-line bg-surface px-3 py-2.5 text-xs text-muted">
              <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-warning" aria-hidden />
              <span>
                Priced at the lowest published band. Confirm the exact rate for
                this quantity when you send your inquiry.
              </span>
            </p>
          ) : null}

          {priced.savingVsFirstTier ? (
            <p className="text-xs font-medium text-success">
              Saving {formatBDT(priced.savingVsFirstTier)} per{" "}
              {unitLabel(product.unit, 1, product.unitLabel)} at this quantity.
            </p>
          ) : null}
        </div>

        {/* Note */}
        <div className="mt-4">
          <label
            htmlFor="line-note"
            className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.08em] text-muted"
          >
            Anything we should know? <span className="font-normal normal-case tracking-normal text-faint">(optional)</span>
          </label>
          <textarea
            id="line-note"
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Deadline, artwork status, colour reference, delivery address…"
            className="w-full resize-none rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-faint focus:border-brand/40 focus:ring-2 focus:ring-brand/15"
          />
        </div>

        {/* Actions — desktop */}
        <div className="mt-5 hidden gap-3 md:flex">
          <button
            type="button"
            onClick={handleInquiry}
            disabled={pending || !activeSku}
            className="inline-flex h-12 flex-1 items-center justify-center gap-2.5 rounded-lg bg-brand px-6 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-dark hover:shadow-md active:scale-[0.98] disabled:opacity-60"
          >
            {pending ? (
              <Loader2 className="size-5 animate-spin" aria-hidden />
            ) : (
              <MessageCircle className="size-5" aria-hidden />
            )}
            {pending ? "Opening WhatsApp…" : "Send inquiry on WhatsApp"}
          </button>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!activeSku}
            className={cn(
              "inline-flex h-12 items-center justify-center gap-2 rounded-lg border px-5 text-sm font-medium transition-all active:scale-[0.98] disabled:opacity-60",
              added
                ? "border-success/30 bg-success/10 text-success"
                : "border-line-strong bg-white text-ink hover:border-ink hover:bg-surface",
            )}
          >
            {added ? <Check className="size-5" aria-hidden /> : <ShoppingBag className="size-5" aria-hidden />}
            {added ? "Added" : "Add to list"}
          </button>
        </div>

        {!activeSku ? (
          <p className="mt-3 rounded-lg border border-warning/25 bg-warning-tint px-3 py-2.5 text-xs text-warning">
            That combination isn&apos;t available. Try a different option above,
            or message us — we can usually make it.
          </p>
        ) : null}

        <p className="mt-3 text-center text-xs text-faint md:text-left">
          No payment, no checkout. Sending an inquiry just starts a WhatsApp
          conversation with our team.
        </p>
      </div>

      {/* Actions — mobile sticky bar. The right column carries pb-24 so this
          never covers content. */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 p-3 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] backdrop-blur-md md:hidden">
        <div className="mb-2 flex items-baseline justify-between px-1">
          <span className="text-xs text-muted">
            {formatQty(quantity, product.unit, product.unitLabel)}
          </span>
          <span className="text-base font-semibold tabular-nums text-ink">
            {priced.isPriceOnRequest ? "On request" : formatBDT(priced.lineTotal)}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!activeSku}
            className={cn(
              "inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-lg border text-sm font-medium transition-all active:scale-[0.98]",
              added
                ? "border-success/30 bg-success/10 text-success"
                : "border-line-strong bg-white text-ink",
            )}
          >
            {added ? <Check className="size-4" aria-hidden /> : <ShoppingBag className="size-4" aria-hidden />}
            {added ? "Added" : "Add"}
          </button>
          <button
            type="button"
            onClick={handleInquiry}
            disabled={pending || !activeSku}
            className="inline-flex h-11 flex-[2] items-center justify-center gap-2 rounded-lg bg-brand text-sm font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-60"
          >
            {pending ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <MessageCircle className="size-4" aria-hidden />
            )}
            Send inquiry
          </button>
        </div>
      </div>
    </div>
  );
}
