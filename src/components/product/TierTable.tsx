"use client";

import { cn, formatBDT, formatTierRange } from "@/lib/utils";
import type { TierRange, UnitKindLike } from "@/lib/pricing";

/**
 * Quantity-break table.
 *
 * Ranges come from buildTierRanges(), never from hand-written labels. The
 * source price list is written as "50-100, 100-200", and rendering that
 * literally puts a quantity of exactly 100 in two rows at once.
 */
export function TierTable({
  tiers,
  activeIndex,
  unit,
  unitLabel,
  onPick,
}: {
  tiers: TierRange[];
  activeIndex: number;
  unit: UnitKindLike;
  unitLabel?: string | null;
  onPick?: (minQty: number) => void;
}) {
  if (tiers.length === 0) return null;

  const cheapest = Math.min(...tiers.map((t) => t.unitPrice));

  return (
    <div className="overflow-hidden rounded-xl border border-line">
      <table className="w-full text-sm">
        <caption className="sr-only">Price by quantity</caption>
        <thead>
          <tr className="border-b border-line bg-surface text-left">
            <th scope="col" className="px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.08em] text-muted">
              Quantity
            </th>
            <th scope="col" className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-[0.08em] text-muted">
              Price / {unitLabel ?? unit.toLowerCase()}
            </th>
          </tr>
        </thead>
        <tbody>
          {tiers.map((tier) => {
            const active = tier.index === activeIndex;
            const best = tier.unitPrice === cheapest && tiers.length > 1;

            return (
              <tr
                key={tier.index}
                onClick={onPick ? () => onPick(tier.minQty) : undefined}
                className={cn(
                  "border-b border-line last:border-0 transition-colors",
                  onPick && "cursor-pointer",
                  active ? "bg-brand-tint" : "bg-white hover:bg-surface",
                )}
              >
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "tabular-nums",
                      active ? "font-semibold text-ink" : "text-body",
                    )}
                  >
                    {formatTierRange(tier.minQty, tier.maxQty, unit, unitLabel)}
                  </span>
                  {best ? (
                    <span className="ml-2 rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-success">
                      Best rate
                    </span>
                  ) : null}
                </td>
                <td className="px-4 py-3 text-right">
                  {tier.compareAtPrice ? (
                    <span className="mr-1.5 text-xs text-faint line-through tabular-nums">
                      {formatBDT(tier.compareAtPrice)}
                    </span>
                  ) : null}
                  <span
                    className={cn(
                      "tabular-nums",
                      active
                        ? "text-base font-semibold text-brand"
                        : "font-medium text-ink",
                    )}
                  >
                    {formatBDT(tier.unitPrice)}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
