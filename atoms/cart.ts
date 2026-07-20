import AsyncStorage from "@react-native-async-storage/async-storage";
import { atom } from "jotai";
import { atomWithStorage, createJSONStorage, unwrap } from "jotai/utils";

import type { ItemWithDistance } from "@/services/models/Item";
import type { ListType } from "@/services/storage";

export type CartItem = {
    item: ItemWithDistance;
    category: ListType;
    addedAt: number;
};

const cartStorage = createJSONStorage<CartItem[]>(() => AsyncStorage);

const storedCartItemsAtom = atomWithStorage<CartItem[]>(
    "healthy-plan-cart",
    [],
    cartStorage,
);

export const cartItemsAtom = unwrap(storedCartItemsAtom, () => []);

export const cartItemCountAtom = atom((get) => get(cartItemsAtom).length);

export const addCartItemAtom = atom(
    null,
    (get, set, item: ItemWithDistance, category: ListType) => {
        const currentItems = get(cartItemsAtom);
        const isAlreadyAdded = currentItems.some(
            (cartItem) =>
                cartItem.item.id === item.id && cartItem.category === category,
        );

        if (isAlreadyAdded) return;

        set(cartItemsAtom, [...currentItems, { item, category, addedAt: Date.now() }]);
    },
);

export const removeCartItemAtom = atom(
    null,
    (get, set, itemId: string, category: ListType) => {
        set(
            cartItemsAtom,
            get(cartItemsAtom).filter(
                (cartItem) =>
                    cartItem.item.id !== itemId || cartItem.category !== category,
            ),
        );
    },
);

export const moveCartItemAtom = atom(
    null,
    (get, set, fromIndex: number, toIndex: number) => {
        const items = get(cartItemsAtom);
        if (
            fromIndex === toIndex ||
            fromIndex < 0 ||
            toIndex < 0 ||
            fromIndex >= items.length ||
            toIndex >= items.length
        ) {
            return;
        }

        const updatedItems = [...items];
        const [movedItem] = updatedItems.splice(fromIndex, 1);
        updatedItems.splice(toIndex, 0, movedItem);
        set(cartItemsAtom, updatedItems);
    },
);

export const clearCartAtom = atom(null, (_get, set) => {
    set(cartItemsAtom, []);
});

export const isCartItemAtom = atom(
    (get) => (itemId: string, category: ListType) =>
        get(cartItemsAtom).some(
            (cartItem) =>
                cartItem.item.id === itemId && cartItem.category === category,
        ),
);