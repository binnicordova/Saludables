import * as Linking from "expo-linking";
import type { CartItem } from "@/atoms/cart";
import type { ItemWithDistance } from "@/services/models/Item";
import type { ListType } from "@/services/storage";
import { getCategory as categoryFromItem } from "@/constants/categories";

/**
 * Encodes an array of cart items into a compact string format for deep linking.
 * Format: `category:id|category:id`
 */
export function encodeCartToQuery(cartItems: CartItem[]): string {
    return cartItems
        .map(({ item, category }) => `${category}:${item.id}`)
        .join("|");
}

/**
 * Decodes a serialized query string back into resolved database entities.
 */
export function decodeQueryToItems(
    importQuery: string | undefined | null,
    availablePlaces: ItemWithDistance[],
): { item: ItemWithDistance; category: ListType }[] {
    if (!importQuery) return [];

    const pairs = importQuery.split("|");
    const resolved: { item: ItemWithDistance; category: ListType }[] = [];

    for (const pair of pairs) {
        const [categoryPart, idPart] = pair.split(":");
        if (!categoryPart || !idPart) continue;

        const foundPlace = availablePlaces.find(
            (p) => p.id === idPart && categoryFromItem(p) === categoryPart,
        );

        if (foundPlace) {
            resolved.push({
                item: foundPlace,
                category: categoryPart as ListType,
            });
        }
    }

    return resolved;
}

/**
 * Generates the full deep link import URL for the given cart items.
 */
export function generateImportUrl(cartItems: CartItem[]): string {
    if (cartItems.length === 0) return "";
    const idsQuery = encodeCartToQuery(cartItems);
    return Linking.createURL("cart", {
        queryParams: { import: idsQuery },
    });
}
