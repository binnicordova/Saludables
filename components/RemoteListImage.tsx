import { Image } from "expo-image";
import { useEffect, useMemo, useState } from "react";
import type { ImageStyle, StyleProp } from "react-native";

type ListImageCategory = "beach" | "pool" | "hotel" | "restaurant" | "tourism";

const FALLBACK_IMAGES: Record<ListImageCategory, string> = {
    beach:
        "https://images.unsplash.com/photo-1473116763249-2faaef81ccda?auto=format&fit=crop&w=1000&q=85",
    pool:
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=85",
    hotel:
        "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1000&q=85",
    restaurant:
        "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=1000&q=85",
    tourism:
        "https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=1000&q=85",
};

const isUsablePhotoUrl = (url: string) => {
    const normalized = url.trim().toLowerCase();
    return (
        normalized.includes("veranosaludable.minsa.gob.pe/storage/") ||
        normalized.includes("images.unsplash.com/") ||
        /\.(avif|gif|jpe?g|png|webp)(\?.*)?$/.test(normalized)
    );
};

type Props = {
    category: ListImageCategory;
    source?: string | null;
    style: StyleProp<ImageStyle>;
    contentFit?: "cover" | "contain";
};

export default function RemoteListImage({
    category,
    source,
    style,
    contentFit = "cover",
}: Props) {
    const fallback = FALLBACK_IMAGES[category];
    const initialUri = useMemo(() => {
        if (!source || !isUsablePhotoUrl(source)) return fallback;
        return source.replace(/^http:/, "https:");
    }, [fallback, source]);
    const [uri, setUri] = useState(initialUri);

    useEffect(() => {
        setUri(initialUri);
    }, [initialUri]);

    return (
        <Image
            source={{ uri }}
            style={style}
            contentFit={contentFit}
            transition={180}
            onError={() => setUri(fallback)}
        />
    );
}