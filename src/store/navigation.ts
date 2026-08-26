"use client";

import { create } from "zustand";

type NavigationStore = {
  pending: boolean;
  target: string | null;
  start: (target?: string) => void;
  stop: () => void;
};

export const useNavigationStore = create<NavigationStore>((set) => ({
  pending: false,
  target: null,
  start: (target) => set({ pending: true, target: target ?? null }),
  stop: () => set({ pending: false, target: null }),
}));

/** Call before `router.push` so programmatic navigations show the overlay too. */
export function startNavigation(target: string) {
  useNavigationStore.getState().start(target);
}
