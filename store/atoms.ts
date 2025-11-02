import { atom } from "jotai";

// Controls whether the bottom tab bar is visible.
// Default: true (visible)
export const shouldHideElementsAtom = atom<boolean>(true);

// Optional helper that toggles visibility
export const setHideElementsAtom = atom(null, (get, set) =>
    set(shouldHideElementsAtom, !get(shouldHideElementsAtom)),
);
