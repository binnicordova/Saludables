import { StyleSheet, View, Pressable } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Typography } from "@/components/ui/Typography";
import { COLORS, SPACING, RADIUS } from "@/constants/theme";
import RemoteListImage from "@/components/RemoteListImage";
import type { ItemWithDistance } from "@/services/models/Item";
import type { ListType } from "@/services/storage";
import * as Linking from "expo-linking";

interface RetreatCardProps {
    item: ItemWithDistance;
    type: ListType;
    isFavorite: boolean;
    onToggleFavorite: () => void;
}

export const RetreatCard = ({
    item,
    type,
    isFavorite,
    onToggleFavorite
}: RetreatCardProps) => {
    const place = [item.strDistrito, item.strDepartamento].filter(Boolean).join(", ") || "Perú";
    const openRoute = () => Linking.openURL(item.mapUrl ?? `https://www.google.com/maps/dir/?api=1&destination=${item.strLatitud},${item.strLongitud}`);

    return (
        <Pressable onPress={openRoute} style={styles.retreatCard}>
            <RemoteListImage category={type} source={item.urlFoto} style={styles.retreatImage} />
            <View style={styles.retreatBody}>
                <View style={styles.retreatTitleRow}>
                    <Typography variant="body" bold numberOfLines={1} style={styles.retreatTitle}>
                        {item.strNombre}
                    </Typography>
                    <Pressable 
                        accessibilityLabel={isFavorite ? "Quitar de guardados" : "Guardar lugar"} 
                        hitSlop={8} 
                        onPress={(event) => { event.stopPropagation(); onToggleFavorite(); }}
                    >
                        <MaterialIcons name={isFavorite ? "favorite" : "favorite-border"} size={18} color={COLORS.primary} />
                    </Pressable>
                </View>
                <View style={styles.locationRow}>
                    <MaterialIcons name={type === "hotel" ? "hotel" : "restaurant"} size={14} color={COLORS.muted} />
                    <Typography variant="label" numberOfLines={1} style={styles.locationText}>
                        {place}
                    </Typography>
                </View>
                <Pressable onPress={openRoute} style={styles.bookButton}>
                    <Typography variant="label" bold color={COLORS.white} style={styles.bookText}>
                        Ver tu ruta
                    </Typography>
                </Pressable>
            </View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    retreatCard: { 
        width: 278, 
        borderRadius: RADIUS.xl, 
        overflow: "hidden", 
        backgroundColor: COLORS.surface, 
        shadowColor: COLORS.secondary, 
        shadowOpacity: 0.08, 
        shadowRadius: 12, 
        elevation: 3 
    },
    retreatImage: { 
        width: "100%", 
        height: 140 
    },
    retreatBody: { 
        padding: 15 
    },
    retreatTitleRow: { 
        flexDirection: "row", 
        justifyContent: "space-between", 
        alignItems: "center", 
        gap: 8 
    },
    retreatTitle: { 
        flex: 1 
    },
    locationRow: { 
        flexDirection: "row", 
        alignItems: "center", 
        gap: 4, 
        marginTop: 6 
    },
    locationText: { 
        flex: 1 
    },
    bookButton: { 
        marginTop: 14, 
        backgroundColor: COLORS.primary, 
        paddingVertical: 9, 
        borderRadius: RADIUS.md, 
        alignItems: "center" 
    },
    bookText: { 
        fontSize: 12 
    },
});
