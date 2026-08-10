"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { UnitKindLike } from "@/lib/pricing";

/**
 * The cart stores WHAT was configured, never WHAT IT COST.
 *
 * Prices are re-resolved from the database on every render (and again,
 * authoritatively, on the server when the inquiry is submitted). A cart
 * persisted last week must reflect a price the admin edited yesterday, and a
 * user editing localStorage must not be able to change what we quote.
 */

export interface CartLine {
  /** `${productId}:${skuId}` — one line per configured combination. */
  key: string;
  productId: string;
  productSlug: string;
  productName: string;
  skuId: string;
  /** Display only; the server re-derives these from skuId. */
  optionLabels: { option: string; value: string }[];
  /** Query string that reproduces the configuration, e.g. "?material=wood". */
  optionQuery: string;
  imageUrl: string | null;
  unit: UnitKindLike;
  unitLabel: string | null;
  qtyStep: number;
  quantity: number;
  /** Free text carried into the WhatsApp message (e.g. banner dimensions). */
  note?: string;
  addedAt: number;
}

interface CartState {
  lines: CartLine[];
  hydrated: boolean;
  add: (line: Omit<CartLine, "key" | "addedAt">) => void;
  setQuantity: (key: string, quantity: number) => void;
  setNote: (key: string, note: string) => void;
  remove: (key: string) => void;
  clear: () => void;
}

export const lineKey = (productId: string, skuId: string) => `${productId}:${skuId}`;

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      hydrated: false,

      add: (input) =>
        set((state) => {
          const key = lineKey(input.productId, input.skuId);
          const existing = state.lines.find((l) => l.key === key);

          // Same product + same configuration: add to the quantity rather than
          // creating a second identical line.
          if (existing) {
            return {
              lines: state.lines.map((l) =>
                l.key === key
                  ? {
                      ...l,
                      quantity: l.quantity + input.quantity,
                      note: input.note ?? l.note,
                    }
                  : l,
              ),
            };
          }

          return {
            lines: [...state.lines, { ...input, key, addedAt: Date.now() }],
          };
        }),

      setQuantity: (key, quantity) =>
        set((state) => ({
          lines: state.lines.map((l) =>
            l.key === key ? { ...l, quantity: Math.max(0, quantity) } : l,
          ),
        })),

      setNote: (key, note) =>
        set((state) => ({
          lines: state.lines.map((l) => (l.key === key ? { ...l, note } : l)),
        })),

      remove: (key) =>
        set((state) => ({ lines: state.lines.filter((l) => l.key !== key) })),

      clear: () => set({ lines: [] }),
    }),
    {
      name: "corpomerch-cart",
      version: 1,
      partialize: (state) => ({ lines: state.lines }),
      onRehydrateStorage: () => (state) => {
        // Lets components render a stable server/client tree and only show real
        // counts once localStorage has been read — otherwise the cart badge
        // hydration-mismatches on every page load.
        if (state) state.hydrated = true;
      },
    },
  ),
);

export const useCartCount = () =>
  useCartStore((s) => (s.hydrated ? s.lines.length : 0));
