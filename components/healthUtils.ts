import * as Linking from "expo-linking";

export const evolutiveDistanceText = (distance?: number) => {
    if (!distance) return "No disponible";
    return distance < 1000
        ? `${Math.round(distance)} m`
        : `${(distance / 1000).toFixed(2)} km`;
};

export const getHealthColor = (key?: string) => {
    const isNonHealthy = (key || "").toLowerCase() === "ns";
    return isNonHealthy
        ? { color: "#C62828", light: "#FDECEA" }
        : { color: "#2E7D32", light: "#E8F5E9" };
};

export const timeAgo = (dateStr?: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";

    const now = new Date();
    const sec = Math.floor((now.getTime() - d.getTime()) / 1000);
    if (sec < 60) return `${sec}s`;
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min}m`;
    const hrs = Math.floor(min / 60);
    if (hrs < 24) return `${hrs}h`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days}d`;

    let years = now.getFullYear() - d.getFullYear();
    let months = now.getMonth() - d.getMonth();
    if (now.getDate() < d.getDate()) months -= 1;
    if (months < 0) {
        years -= 1;
        months += 12;
    }

    const totalMonths = years * 12 + months;
    if (totalMonths < 12) return `${Math.max(1, totalMonths)}mo`;
    return `${years}y`;
};

export const MAP_URL = (lat?: string, lng?: string) =>
    lat && lng
        ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
        : "";

export const openMaps = (lat?: string, lng?: string) => {
    const url = MAP_URL(lat, lng);
    if (!url) return;
    Linking.openURL(url);
};

export default {};
