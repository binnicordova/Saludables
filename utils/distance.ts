import type { ItemWithDistance } from "@/services/models/Item";

export const distanceInMeters = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
): number => {
    if (![lat1, lon1, lat2, lon2].every((val) => Number.isFinite(val))) {
        return Number.POSITIVE_INFINITY;
    }
    const toRadians = (degrees: number) => degrees * (Math.PI / 180);

    const R = 6371e3; // Earth radius in meters
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

export const distanceBetween = (
    first: { strLatitud?: string; strLongitud?: string },
    second: { strLatitud?: string; strLongitud?: string },
): number => {
    const lat1 = Number(first.strLatitud);
    const lon1 = Number(first.strLongitud);
    const lat2 = Number(second.strLatitud);
    const lon2 = Number(second.strLongitud);

    return distanceInMeters(lat1, lon1, lat2, lon2);
};

export const formatDistance = (distance?: number): string => {
    if (distance === undefined || !Number.isFinite(distance))
        return "Cerca de ti";
    if (distance < 1000) return `${Math.round(distance)} m`;
    return `${(distance / 1000).toFixed(1)} km`;
};

export const formatTotalDistance = (
    items: { item: ItemWithDistance }[],
): string => {
    const totalMeters = items.reduce(
        (total, { item }) =>
            total + (Number.isFinite(item.distance) ? (item.distance ?? 0) : 0),
        0,
    );
    return totalMeters > 0
        ? `${(totalMeters / 1000).toFixed(1)} km`
        : "Por definir";
};
