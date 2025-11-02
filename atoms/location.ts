import { getCurrentLocation } from "@/services/location";
import type * as Location from "expo-location";
import { atom } from "jotai";

const locationAtom = atom<Location.LocationObject | null>(null);

export const currentLocationAtom = atom(
    async (get) => {
        let location: Location.LocationObject | null = get(locationAtom);
        if (!location) {
            location = await getCurrentLocation();
        }
        return location;
    },
    (get, set, location: Location.LocationObject | null) => {
        set(locationAtom, location);
    },
);
