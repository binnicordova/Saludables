import type { Item, ItemWithDistance } from "@/services/models/Item";
import dataService from "@/services/storage";
import type { DownloadSource, ListType } from "@/services/storage";
import type * as Location from "expo-location";
import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { currentLocationAtom } from "./location";

const distanceInMeters = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
) => {
    const toRadians = (degrees: number) => degrees * (Math.PI / 180);

    const R = 6371e3;
    const φ1 = toRadians(lat1);
    const φ2 = toRadians(lat2);
    const Δφ = toRadians(lat2 - lat1);
    const Δλ = toRadians(lon2 - lon1);

    const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
};

const sortDataAccordingLocation = (
    data: Item[],
    location: Location.LocationObject,
): ItemWithDistance[] => {
    return data
        .map((item) => {
            const distance = distanceInMeters(
                Number(item.strLatitud),
                Number(item.strLongitud),
                location.coords.latitude,
                location.coords.longitude,
            );
            const mapUrl = `https://www.google.com/maps/dir/?api=1&destination=${item.strLatitud},${item.strLongitud}`;
            return { ...item, distance, mapUrl };
        })
        .sort((a, b) => {
            if (a.distance === null || b.distance === null) return 0;
            return a.distance - b.distance;
        });
};

export const listTypeAtom = atom<
    "beach" | "pool" | "hotel" | "restaurant" | "tourism"
>("beach");
export const shouldFilterHealthAtom = atom<boolean>(true);

// add filter atom here so makeFilteredListAtom can read it
export const filterValueAtom = atom<string>("");

const beachListDataAtom = atomWithStorage<ItemWithDistance[]>(
    "beachListData",
    [],
);
const poolListDataAtom = atomWithStorage<ItemWithDistance[]>(
    "poolListData",
    [],
);
const hotelListDataAtom = atomWithStorage<ItemWithDistance[]>(
    "hotelListData",
    [],
);
const restaurantListDataAtom = atomWithStorage<ItemWithDistance[]>(
    "restaurantListData",
    [],
);
const tourismListDataAtom = atomWithStorage<ItemWithDistance[]>(
    "tourismListData",
    [],
);

const HEALTHY_KEY = "ns";

const makeFilteredListAtom = (
    baseAtom:
        | typeof beachListDataAtom
        | typeof poolListDataAtom
        | typeof hotelListDataAtom
        | typeof restaurantListDataAtom
        | typeof tourismListDataAtom,
) =>
    atom((get) => {
        const list = get(baseAtom);

        // apply health filter if enabled
        let result = list;
        if (get(shouldFilterHealthAtom)) {
            result = result.filter(
                (item: ItemWithDistance) =>
                    item.keyCalidadSanitaria !== HEALTHY_KEY,
            );
        }

        // apply text filter from filterValueAtom if present
        const q = (get(filterValueAtom) || "").toString().trim().toLowerCase();
        if (q.length > 0) {
            result = result.filter((item: ItemWithDistance) => {
                const name = (item.strNombre || "").toString().toLowerCase();
                const dept = (item.strDepartamento || "")
                    .toString()
                    .toLowerCase();
                const prov = (item.strProvincia || "").toString().toLowerCase();
                const dist = (item.strDistrito || "").toString().toLowerCase();
                return (
                    name.includes(q) ||
                    dept.includes(q) ||
                    prov.includes(q) ||
                    dist.includes(q)
                );
            });
        }

        return result;
    });

export const getBeachListDataAtom = makeFilteredListAtom(beachListDataAtom);
export const getPoolListDataAtom = makeFilteredListAtom(poolListDataAtom);
export const getHotelListDataAtom = makeFilteredListAtom(hotelListDataAtom);
export const getRestaurantListDataAtom = makeFilteredListAtom(
    restaurantListDataAtom,
);
export const getTourismListDataAtom = makeFilteredListAtom(tourismListDataAtom);
export const getAllFilteredListDataAtom = atom((get) => {
    const beaches = get(getBeachListDataAtom);
    const pools = get(getPoolListDataAtom);
    const hotels = get(getHotelListDataAtom);
    const restaurants = get(getRestaurantListDataAtom);
    const tourism = get(getTourismListDataAtom);
    return [...beaches, ...pools, ...hotels, ...restaurants, ...tourism];
});

export const updateListDataAtom = atom(
    null,
    async (get, set, update: Item[], list: ListType = "pool") => {
        const location = await get(currentLocationAtom);
        const sortedData = location
            ? sortDataAccordingLocation(update, location)
            : update;
        let targetAtom: typeof beachListDataAtom;
        switch (list) {
            case "beach":
                targetAtom = beachListDataAtom;
                break;
            case "pool":
                targetAtom = poolListDataAtom;
                break;
            case "hotel":
                targetAtom = hotelListDataAtom;
                break;
            case "restaurant":
                targetAtom = restaurantListDataAtom;
                break;
            case "tourism":
                targetAtom = tourismListDataAtom;
                break;
            default:
                targetAtom = poolListDataAtom;
                break;
        }
        set(targetAtom, sortedData);
    },
);

type ListDownloadState = {
    isLoading: boolean;
    isRefreshing: boolean;
    error: string | null;
    lastUpdated: number | null;
    source: DownloadSource | null;
};

const DEFAULT_DOWNLOAD_STATE: ListDownloadState = {
    isLoading: false,
    isRefreshing: false,
    error: null,
    lastUpdated: null,
    source: null,
};

const listDownloadStateAtom = atom<Record<ListType, ListDownloadState>>({
    beach: { ...DEFAULT_DOWNLOAD_STATE },
    pool: { ...DEFAULT_DOWNLOAD_STATE },
    hotel: { ...DEFAULT_DOWNLOAD_STATE },
    restaurant: { ...DEFAULT_DOWNLOAD_STATE },
    tourism: { ...DEFAULT_DOWNLOAD_STATE },
});

const setListDownloadStateAtom = atom(
    null,
    (get, set, list: ListType, patch: Partial<ListDownloadState>) => {
        const currentState = get(listDownloadStateAtom);
        set(listDownloadStateAtom, {
            ...currentState,
            [list]: {
                ...currentState[list],
                ...patch,
            },
        });
    },
);

export const beachDownloadStateAtom = atom(
    (get) => get(listDownloadStateAtom).beach,
);
export const poolDownloadStateAtom = atom(
    (get) => get(listDownloadStateAtom).pool,
);
export const hotelDownloadStateAtom = atom(
    (get) => get(listDownloadStateAtom).hotel,
);
export const restaurantDownloadStateAtom = atom(
    (get) => get(listDownloadStateAtom).restaurant,
);
export const tourismDownloadStateAtom = atom(
    (get) => get(listDownloadStateAtom).tourism,
);

export const isLoadingAtom = atom((get) => {
    const state = get(listDownloadStateAtom);
    return (
        state.beach.isLoading ||
        state.beach.isRefreshing ||
        state.pool.isLoading ||
        state.pool.isRefreshing ||
        state.hotel.isLoading ||
        state.hotel.isRefreshing ||
        state.restaurant.isLoading ||
        state.restaurant.isRefreshing ||
        state.tourism.isLoading ||
        state.tourism.isRefreshing
    );
});
export const errorAtom = atom((get) => {
    const state = get(listDownloadStateAtom);
    return (
        state.beach.error ??
        state.pool.error ??
        state.hotel.error ??
        state.restaurant.error ??
        state.tourism.error
    );
});

export const refreshListDataAtom = atom(
    null,
    async (get, set, list: ListType = "pool") => {
        let currentData: ItemWithDistance[] = [];
        switch (list) {
            case "beach":
                currentData = get(beachListDataAtom);
                break;
            case "pool":
                currentData = get(poolListDataAtom);
                break;
            case "hotel":
                currentData = get(hotelListDataAtom);
                break;
            case "restaurant":
                currentData = get(restaurantListDataAtom);
                break;
            case "tourism":
                currentData = get(tourismListDataAtom);
                break;
        }
        const hasExistingData = currentData.length > 0;

        set(setListDownloadStateAtom, list, {
            isLoading: !hasExistingData,
            isRefreshing: hasExistingData,
            error: null,
        });

        console.log("Refreshing list data for:", list);

        try {
            const response = await dataService.listWithMeta(list);
            await set(updateListDataAtom, response.data, list);
            set(setListDownloadStateAtom, list, {
                isLoading: false,
                isRefreshing: false,
                error: null,
                lastUpdated: response.meta.lastUpdated,
                source: response.meta.source,
            });
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "No se pudo actualizar la lista";
            set(setListDownloadStateAtom, list, {
                isLoading: false,
                isRefreshing: false,
                error: message,
            });
        }
    },
);

export const favoritesAtom = atomWithStorage<string[]>("favorites", []);

export const toggleFavoriteAtom = atom(null, (get, set, id: string) => {
    const current = get(favoritesAtom) || [];
    if (current.includes(id)) {
        set(
            favoritesAtom,
            current.filter((x) => x !== id),
        );
    } else {
        set(favoritesAtom, [...current, id]);
    }
});

export const isFavoriteAtom = atom(
    (get) => (id: string) => (get(favoritesAtom) || []).includes(id),
);
