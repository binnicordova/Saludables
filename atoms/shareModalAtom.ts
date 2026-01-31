import AsyncStorage from "@react-native-async-storage/async-storage";
import { atom } from "jotai";
import { atomWithStorage, createJSONStorage } from "jotai/utils";

export interface ShareModalState {
    lastShown: string | null;
    deferredUntil: string | null;
}

const storage = createJSONStorage<ShareModalState>(() => AsyncStorage);

export const shareModalAtom = atomWithStorage<ShareModalState>(
    "shareModalState",
    {
        lastShown: null,
        deferredUntil: null,
    },
    storage,
);

export const markShareModalAsClosedAtom = atom(null, (get, set) => {
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 3);
    set(shareModalAtom, {
        lastShown: new Date().toISOString(),
        deferredUntil: nextDate.toISOString(),
    });
});

export const markShareModalAsCompletedAtom = atom(null, (get, set) => {
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 7);
    set(shareModalAtom, {
        lastShown: new Date().toISOString(),
        deferredUntil: nextDate.toISOString(),
    });
});

export const shouldShowShareModalAtom = atom((get) => {
    const stateOrPromise = get(shareModalAtom);

    if (stateOrPromise instanceof Promise) {
        return stateOrPromise.then((state) => {
            const { lastShown, deferredUntil } = state;
            const now = new Date();

            if (deferredUntil && new Date(deferredUntil) > now) return false;
            if (lastShown?.split("T")[0] === now.toISOString().split("T")[0])
                return false;

            return true;
        });
    }

    const { lastShown, deferredUntil } = stateOrPromise;
    const now = new Date();

    if (deferredUntil && new Date(deferredUntil) > now) return false;
    if (lastShown?.split("T")[0] === now.toISOString().split("T")[0])
        return false;

    return true;
});
