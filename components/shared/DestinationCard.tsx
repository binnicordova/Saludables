import { StyleSheet, View, Pressable } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { addCartItemAtom, isCartItemAtom } from "@/atoms/cart";
import { Typography } from "@/components/ui/Typography";
import { COLORS, SPACING, RADIUS } from "@/constants/theme";
import RemoteListImage from "@/components/RemoteListImage";
import type { ItemWithDistance } from "@/services/models/Item";
import type { ListType } from "@/services/storage";
import { useAtomValue, useSetAtom } from "jotai";
import { router } from "expo-router";

interface DestinationCardProps {
    item: ItemWithDistance;
    category: ListType;
    isFavorite: boolean;
    onToggleFavorite: () => void;
    showDescription?: boolean;
    onPress?: () => void;
}

export const DestinationCard = ({
    item,
    category,
    isFavorite,
    onToggleFavorite,
    showDescription = true,
    onPress,
}: DestinationCardProps) => {

    const addCartItem = useSetAtom(addCartItemAtom);
    const isInCart = useAtomValue(isCartItemAtom);

    const locationLabel = [item.strDistrito, item.strProvincia, item.strDepartamento]
        .filter(Boolean)
        .join(", ") || "Perú";

    const isSaludable = item.keyCalidadSanitaria?.toLowerCase() !== "ns";
    const isAddedToPlan = isInCart(item.id, category);

    return (
        <Pressable style={styles.card} onPress={onPress}>
            <RemoteListImage
                category={category}
                source={item.urlFoto}
                style={styles.image}
            />
            
            <View style={[styles.badge, { backgroundColor: isSaludable ? COLORS.success : COLORS.primary }]}>
                <MaterialIcons name="verified" size={12} color={COLORS.white} />
                <Typography variant="label" style={styles.badgeText}>
                    {isSaludable ? "SALUDABLE" : "REVISAR"}
                </Typography>
            </View>

            <View style={styles.body}>
                <View style={styles.titleRow}>
                    <Typography variant="body" bold numberOfLines={1} style={styles.title}>
                        {item.strNombre}
                    </Typography>
                    <View style={styles.actions}>
                        <Pressable
                            accessibilityLabel={isFavorite ? "Quitar de guardados" : "Guardar lugar"}
                            accessibilityRole="button"
                            hitSlop={8}
                            onPress={(event) => {
                                event.stopPropagation();
                                onToggleFavorite();
                            }}
                        >
                            <MaterialIcons 
                                name={isFavorite ? "favorite" : "favorite-border"} 
                                size={20} 
                                color={COLORS.primary} 
                            />
                        </Pressable>
                    </View>
                </View>

                {showDescription && (
                    <Typography variant="bodySmall" color={COLORS.muted} numberOfLines={2} style={styles.description}>
                        {item.strDescripcion || item.strCalidadSanitaria || "Calidad sanitaria verificada para ti."}
                    </Typography>
                )}

                <View style={styles.footerRow}>
                    <View style={styles.metaRow}>
                        <MaterialIcons name="location-on" size={15} color={COLORS.muted} />
                        <Typography variant="label" numberOfLines={1} style={styles.metaText}>
                            {locationLabel}
                        </Typography>
                        {item.distance ? (
                            <View style={styles.distanceBadge}>
                                <MaterialIcons name="near-me" size={10} color={COLORS.primary} />
                                <Typography variant="label" bold color={COLORS.primary} style={styles.distanceText}>
                                    {(item.distance / 1000).toFixed(1)} km
                                </Typography>
                            </View>
                        ) : null}
                    </View>

                    <Pressable
                        style={[
                            styles.ctaButton,
                            isAddedToPlan ? styles.ctaButtonAdded : styles.ctaButtonAdd
                        ]}
                        accessibilityLabel={isAddedToPlan ? "Ir a mi plan" : "Añadir a mi plan"}
                        accessibilityRole="button"
                        hitSlop={8}
                        onPress={(event) => {
                            event.stopPropagation();
                            if (isAddedToPlan) {
                                router.push("/cart");
                            } else {
                                addCartItem(item, category);
                            }
                        }}
                    >
                        <MaterialIcons
                            name={isAddedToPlan ? "check-circle" : "add-shopping-cart"}
                            size={14}
                            color={COLORS.white}
                        />
                        <Typography variant="label" bold color={COLORS.white} style={styles.ctaText}>
                            {isAddedToPlan ? "Mi plan" : "Añadir"}
                        </Typography>
                    </Pressable>
                </View>
            </View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.xl,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: COLORS.line,
        shadowColor: COLORS.secondary,
        shadowOpacity: 0.06,
        shadowOffset: { width: 0, height: 5 },
        shadowRadius: 14,
        elevation: 2,
    },
    image: {
        width: "100%",
        height: 154,
    },
    badge: {
        position: "absolute",
        top: 12,
        left: 12,
        flexDirection: "row",
        gap: 3,
        alignItems: "center",
        borderRadius: RADIUS.sm,
        paddingHorizontal: 7,
        paddingVertical: 4,
    },
    badgeText: {
        color: COLORS.white,
        fontSize: 9,
        fontWeight: "800",
    },
    body: {
        padding: SPACING.md,
    },
    titleRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 10,
    },
    title: {
        fontSize: 16,
        flex: 1,
    },
    actions: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    description: {
        marginTop: 4,
    },
    footerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 10,
        gap: 8,
    },
    metaRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        flex: 1,
    },
    metaText: {
        flexShrink: 1,
        color: COLORS.muted,
        fontSize: 11,
    },
    distanceBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: COLORS.palePrimary,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: RADIUS.sm,
        gap: 2,
    },
    distanceText: {
        fontSize: 10,
        fontWeight: "800",
        color: COLORS.primary,
        lineHeight: 13,
    },
    ctaButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: RADIUS.md,
    },
    ctaButtonAdd: {
        backgroundColor: COLORS.primary,
    },
    ctaButtonAdded: {
        backgroundColor: COLORS.success,
    },
    ctaText: {
        fontSize: 11,
        fontWeight: "700",
    },
});
