import type { Item, ItemWithDistance } from "@/services/models/Item";
import dataService from "@/services/storage";
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

export const listTypeAtom = atom<"beach" | "pool">("beach");
export const shouldFilterHealthAtom = atom<boolean>(true);

// add filter atom here so makeFilteredListAtom can read it
export const filterValueAtom = atom<string>("");

const beachListDataAtom = atomWithStorage<ItemWithDistance[]>("beachListData", []);
const poolListDataAtom = atomWithStorage<ItemWithDistance[]>("poolListData", []);

const HEALTHY_KEY = "ns";

const makeFilteredListAtom = (
    baseAtom: typeof beachListDataAtom | typeof poolListDataAtom,
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
export const getAllFilteredListDataAtom = atom((get) => {
    const beaches = get(getBeachListDataAtom);
    const pools = get(getPoolListDataAtom);
    return [...beaches, ...pools];
});

export const updateListDataAtom = atom(
    null,
    async (get, set, update: Item[], list: "pool" | "beach" = "pool") => {
        const location = await get(currentLocationAtom);
        const sortedData = location
            ? sortDataAccordingLocation(update, location)
            : update;
        const targetAtom =
            list === "pool" ? poolListDataAtom : beachListDataAtom;
        set(targetAtom, sortedData);
    },
);

export const isLoadingAtom = atom<boolean>(false);
export const errorAtom = atom<string | null>(null);

export const refreshListDataAtom = atom(
    null,
    async (get, set, list: "pool" | "beach" = "pool") => {
        set(isLoadingAtom, true);
        console.log("Refreshing list data for:", list);
        const response = await dataService.list(list);
        await set(updateListDataAtom, response, list);
        set(isLoadingAtom, false);
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
