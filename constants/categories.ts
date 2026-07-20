import type { ItemWithDistance } from "@/services/models/Item";
import type { ListType } from "@/services/storage";

export const LIST_TYPES: ListType[] = [
    "beach",
    "pool",
    "hotel",
    "restaurant",
    "tourism",
];

export type CategoryMeta = {
    label: string;
    title: string;
    icon: "beach-access" | "pool" | "hotel" | "restaurant" | "map";
};

export const CATEGORY_DETAILS: Record<ListType, CategoryMeta> = {
    beach: { label: "Playa", title: "Playas para ti", icon: "beach-access" },
    pool: { label: "Piscina", title: "Piscinas para ti", icon: "pool" },
    hotel: { label: "Hospedaje", title: "Hospedajes para ti", icon: "hotel" },
    restaurant: {
        label: "Restaurante",
        title: "Restaurantes para ti",
        icon: "restaurant",
    },
    tourism: {
        label: "Destino turístico",
        title: "Turismo para ti",
        icon: "map",
    },
};

export const SOURCE_CATEGORIES: Record<string, ListType> = {
    pl: "beach",
    playa: "beach",
    pi: "pool",
    piscina: "pool",
    ho: "hotel",
    hotel: "hotel",
    re: "restaurant",
    restaurante: "restaurant",
    tourism: "tourism",
    turismo: "tourism",
};

export const getCategory = (place: ItemWithDistance): ListType => {
    return SOURCE_CATEGORIES[place.strSource?.toLowerCase()] ?? "tourism";
};

export const COMPLEMENTARY_COPY: Record<ListType, string> = {
    beach: "Extiende tu día junto al mar",
    pool: "Completa tu momento de bienestar",
    hotel: "Opciones para disfrutar alrededor",
    restaurant: "Sigue descubriendo cerca de aquí",
    tourism: "Haz de tu visita una experiencia completa",
};

export const COMPLEMENTARY_TITLES: Record<ListType, string> = {
    beach: "Playas cercanas",
    pool: "Piscinas cercanas",
    hotel: "Hospedajes cercanos",
    restaurant: "Restaurantes cercanos",
    tourism: "Destinos cercanos",
};
