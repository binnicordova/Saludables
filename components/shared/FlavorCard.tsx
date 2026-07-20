import { StyleSheet, View, Pressable } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Typography } from "@/components/ui/Typography";
import { COLORS, SPACING, RADIUS } from "@/constants/theme";
import RemoteListImage from "@/components/RemoteListImage";
import type { ItemWithDistance } from "@/services/models/Item";
import * as Linking from "expo-linking";

interface FlavorCardProps {
    item: ItemWithDistance;
    large?: boolean;
    isFavorite: boolean;
    onToggleFavorite: () => void;
}

export const FlavorCard = ({ 
    item, 
    large = false, 
    isFavorite, 
    onToggleFavorite 
}: FlavorCardProps) => {
    const place = [item.strDistrito, item.strDepartamento].filter(Boolean).join(", ") || "Perú";
    const openRoute = () => Linking.openURL(item.mapUrl ?? `https://www.google.com/maps/dir/?api=1&destination=${item.strLatitud},${item.strLongitud}`);

    return (
        <Pressable onPress={openRoute} style={[styles.flavorCard, large ? styles.flavorLarge : styles.flavorSmall]}>
            <RemoteListImage category="restaurant" source={item.urlFoto} style={StyleSheet.absoluteFill} />
            <LinearGradient colors={["transparent", "rgba(0,0,0,0.78)"]} style={StyleSheet.absoluteFill} />
            <Pressable 
                accessibilityLabel={isFavorite ? "Quitar de guardados" : "Guardar lugar"} 
                hitSlop={8} 
                onPress={(event) => { event.stopPropagation(); onToggleFavorite(); }} 
                style={styles.flavorFavorite}
            >
                <MaterialIcons name={isFavorite ? "favorite" : "favorite-border"} size={19} color={COLORS.white} />
            </Pressable>
            <View style={styles.flavorCopy}>
                {large && <Typography variant="eyebrow" color={COLORS.white} style={styles.flavorBadge}>ELEGIDO PARA TI</Typography>}
                <Typography variant="body" bold color={COLORS.white} numberOfLines={1} style={[styles.flavorTitle, large && styles.flavorTitleLarge]}>
                    {item.strNombre}
                </Typography>
                <Typography variant="bodySmall" color={COLORS.white} numberOfLines={2} style={styles.flavorDescription}>
                    {item.strDescripcion || place}
                </Typography>
            </View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    flavorCard: { 
        borderRadius: RADIUS.lg, 
        overflow: "hidden", 
        backgroundColor: COLORS.surface 
    },
    flavorLarge: { 
        width: "100%", 
        height: 180, 
        marginBottom: SPACING.md 
    },
    flavorSmall: { 
        width: "48%", 
        height: 140 
    },
    flavorFavorite: { 
        position: "absolute", 
        top: 10, 
        right: 10, 
        zIndex: 2 
    },
    flavorCopy: { 
        position: "absolute", 
        bottom: 0, 
        left: 0, 
        right: 0, 
        padding: SPACING.md 
    },
    flavorBadge: { 
        fontSize: 8, 
        marginBottom: 4 
    },
    flavorTitle: { 
        fontSize: 14 
    },
    flavorTitleLarge: { 
        fontSize: 18 
    },
    flavorDescription: { 
        fontSize: 11, 
        opacity: 0.9 
    },
});
