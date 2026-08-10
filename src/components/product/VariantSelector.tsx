"use client";

import Image from "next/image";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import type { ProductOptionDTO } from "@/types/catalog";

/**
 * Up to three stacked option rows, modelled on the Alibaba-style selector in
 * the reference screenshot.
 *
 * Row 1 (position 1) is the axis that swaps the gallery, so it renders as
 * image thumbnails or colour swatches. Rows 2 and 3 affect price only and
 * render as plain chips.
 */
export function VariantSelector({
  options,
  selection,
  onSelect,
  unavailable,
}: {
  options: ProductOptionDTO[];
  /** optionId -> optionValueId */
  selection: Record<string, string>;
  onSelect: (optionId: string, valueId: string) => void;
  /** Value ids that produce no active SKU given the rest of the selection. */
  unavailable?: Set<string>;
}) {
  if (options.length === 0) return null;

  return (
    <div className="space-y-5 rounded-xl border border-line bg-surface p-4 sm:p-5">
      {options.map((option) => {
        const selectedId = selection[option.id];
        const selectedLabel = option.values.find((v) => v.id === selectedId)?.label;
        const isImageRow =
          option.position === 1 &&
          (option.displayAs === "IMAGE" ||
            option.values.some((v) => v.images.length > 0));

        return (
          <fieldset key={option.id}>
            <legend className="mb-2.5 flex flex-wrap items-baseline gap-x-2 text-xs font-semibold uppercase tracking-[0.08em] text-muted">
              {option.name}
              {selectedLabel ? (
                <span className="text-sm font-medium normal-case tracking-normal text-ink">
                  {selectedLabel}
                </span>
              ) : null}
            </legend>

            {option.helpText ? (
              <p className="-mt-1.5 mb-2.5 text-xs text-faint">{option.helpText}</p>
            ) : null}

            {isImageRow ? (
              <div className="flex flex-wrap gap-2.5">
                {option.values.map((value) => {
                  const selected = value.id === selectedId;
                  const off = unavailable?.has(value.id);
                  const thumb = value.images[0];

                  return (
                    <button
                      key={value.id}
                      type="button"
                      onClick={() => onSelect(option.id, value.id)}
                      aria-pressed={selected}
                      title={value.description ?? value.label}
                      className={cn(
                        "group relative flex w-[5.5rem] flex-col items-center gap-1.5 rounded-lg border-2 bg-white p-1.5 transition-all active:scale-[0.97] sm:w-24",
                        selected
                          ? "border-brand shadow-sm"
                          : "border-line hover:border-line-strong",
                        off && "opacity-40",
                      )}
                    >
                      <span className="relative aspect-square w-full overflow-hidden rounded bg-white">
                        {thumb ? (
                          <Image
                            src={thumb.url}
                            alt=""
                            fill
                            sizes="96px"
                            className="object-contain p-1"
                          />
                        ) : value.swatchHex ? (
                          <span
                            className="block size-full rounded border border-line"
                            style={{ backgroundColor: value.swatchHex }}
                          />
                        ) : (
                          <span className="flex size-full items-center justify-center text-[10px] font-medium text-faint">
                            No image
                          </span>
                        )}
                      </span>
                      <span
                        className={cn(
                          "line-clamp-2 px-0.5 pb-0.5 text-center text-[11px] font-medium leading-tight",
                          selected ? "text-brand" : "text-body",
                        )}
                      >
                        {value.label}
                      </span>
                      {selected ? (
                        <span className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-brand text-white shadow-sm">
                          <Check className="size-3" strokeWidth={3} aria-hidden />
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {option.values.map((value) => {
                  const selected = value.id === selectedId;
                  const off = unavailable?.has(value.id);

                  return (
                    <button
                      key={value.id}
                      type="button"
                      onClick={() => onSelect(option.id, value.id)}
                      aria-pressed={selected}
                      title={value.description ?? undefined}
                      className={cn(
                        "inline-flex items-center gap-2 rounded-lg border-2 bg-white px-3.5 py-2 text-sm font-medium transition-all active:scale-[0.97]",
                        selected
                          ? "border-brand bg-brand-tint text-brand"
                          : "border-line text-body hover:border-line-strong hover:text-ink",
                        off && "opacity-40",
                      )}
                    >
                      {value.swatchHex ? (
                        <span
                          className="size-4 shrink-0 rounded-full border border-line-strong"
                          style={{ backgroundColor: value.swatchHex }}
                          aria-hidden
                        />
                      ) : null}
                      {value.label}
                    </button>
                  );
                })}
              </div>
            )}
          </fieldset>
        );
      })}
    </div>
  );
}
