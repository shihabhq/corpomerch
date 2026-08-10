"use client";

import { useEffect, useState } from "react";
import { Calculator, Minus, Plus } from "lucide-react";

import { money } from "@/lib/pricing";
import type { UnitKindLike } from "@/lib/pricing";
import { cn, unitLabel } from "@/lib/utils";

export function QuantityInput({
  value,
  onChange,
  qtyStep,
  unit,
  unitLabelOverride,
}: {
  value: number;
  onChange: (next: number) => void;
  qtyStep: number;
  unit: UnitKindLike;
  unitLabelOverride?: string | null;
}) {
  // Local text state so the field can be empty or mid-edit without the parent
  // snapping it back to a step on every keystroke.
  const [text, setText] = useState(String(value));
  useEffect(() => setText(String(value)), [value]);

  const commit = (raw: string) => {
    const parsed = Number.parseFloat(raw);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      onChange(qtyStep);
      setText(String(qtyStep));
      return;
    }
    const snapped = money(Math.max(qtyStep, parsed));
    onChange(snapped);
    setText(String(snapped));
  };

  return (
    <div className="flex items-center rounded-lg border border-line-strong bg-white">
      <button
        type="button"
        onClick={() => onChange(money(Math.max(qtyStep, value - qtyStep)))}
        className="flex size-11 shrink-0 items-center justify-center rounded-l-lg text-ink transition-colors hover:bg-surface disabled:opacity-40"
        disabled={value <= qtyStep}
        aria-label="Decrease quantity"
      >
        <Minus className="size-4" />
      </button>

      <div className="flex min-w-0 flex-1 items-baseline justify-center gap-1.5 px-2">
        <input
          type="text"
          inputMode="decimal"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={(e) => commit(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commit(text);
            }
          }}
          aria-label="Quantity"
          className="w-full min-w-0 bg-transparent py-2.5 text-center text-base font-semibold tabular-nums text-ink outline-none"
        />
        <span className="shrink-0 text-xs text-muted">
          {unitLabel(unit, value, unitLabelOverride)}
        </span>
      </div>

      <button
        type="button"
        onClick={() => onChange(money(value + qtyStep))}
        className="flex size-11 shrink-0 items-center justify-center rounded-r-lg text-ink transition-colors hover:bg-surface"
        aria-label="Increase quantity"
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
}

/**
 * Banners and backdrops are quoted per square foot, but customers think in
 * feet — "10 by 25", not "250 sqft". This converts, and hands the raw
 * dimensions back so they can ride along in the WhatsApp message.
 */
export function SqftCalculator({
  onApply,
}: {
  onApply: (sqft: number, description: string) => void;
}) {
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [pieces, setPieces] = useState("1");

  const w = Number.parseFloat(width);
  const h = Number.parseFloat(height);
  const n = Math.max(1, Number.parseInt(pieces, 10) || 1);
  const valid = Number.isFinite(w) && Number.isFinite(h) && w > 0 && h > 0;
  const sqft = valid ? money(w * h * n) : 0;

  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-muted">
        <Calculator className="size-3.5 text-brand" aria-hidden />
        Size calculator
      </p>
      <p className="mt-1 text-xs text-faint">
        Enter the size in feet and we&apos;ll work out the square footage.
      </p>

      <div className="mt-3 grid grid-cols-[1fr_auto_1fr_auto_5rem] items-center gap-2">
        <label className="sr-only" htmlFor="sqft-w">Width in feet</label>
        <input
          id="sqft-w"
          type="number"
          min="0"
          step="0.5"
          value={width}
          onChange={(e) => setWidth(e.target.value)}
          placeholder="Width"
          className="h-10 w-full rounded-lg border border-line bg-white px-3 text-sm tabular-nums outline-none focus:border-brand/40 focus:ring-2 focus:ring-brand/15"
        />
        <span className="text-sm text-faint" aria-hidden>×</span>
        <label className="sr-only" htmlFor="sqft-h">Height in feet</label>
        <input
          id="sqft-h"
          type="number"
          min="0"
          step="0.5"
          value={height}
          onChange={(e) => setHeight(e.target.value)}
          placeholder="Height"
          className="h-10 w-full rounded-lg border border-line bg-white px-3 text-sm tabular-nums outline-none focus:border-brand/40 focus:ring-2 focus:ring-brand/15"
        />
        <span className="text-xs text-faint" aria-hidden>ft ×</span>
        <label className="sr-only" htmlFor="sqft-n">Number of pieces</label>
        <input
          id="sqft-n"
          type="number"
          min="1"
          step="1"
          value={pieces}
          onChange={(e) => setPieces(e.target.value)}
          className="h-10 w-full rounded-lg border border-line bg-white px-3 text-sm tabular-nums outline-none focus:border-brand/40 focus:ring-2 focus:ring-brand/15"
        />
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-sm text-body">
          ={" "}
          <span className="font-semibold tabular-nums text-ink">
            {valid ? sqft.toLocaleString("en-BD") : "—"}
          </span>{" "}
          sq.ft.
        </p>
        <button
          type="button"
          disabled={!valid}
          onClick={() =>
            onApply(
              sqft,
              `${w} ft × ${h} ft${n > 1 ? ` × ${n} pieces` : ""}`,
            )
          }
          className={cn(
            "rounded-lg px-4 py-2 text-xs font-semibold transition-all active:scale-[0.98]",
            valid
              ? "bg-ink text-white hover:bg-black"
              : "cursor-not-allowed bg-surface-alt text-faint",
          )}
        >
          Use this size
        </button>
      </div>
    </div>
  );
}
