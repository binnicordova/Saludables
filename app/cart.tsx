import {
    type CartItem,
    cartItemsAtom,
    clearCartAtom,
    moveCartItemAtom,
    removeCartItemAtom,
} from "@/atoms/cart";
import {
    favoritesAtom,
    getAllListDataAtom,
    refreshListDataAtom,
    toggleFavoriteAtom,
} from "@/atoms/listAtom";
import RemoteListImage from "@/components/RemoteListImage";
import { DestinationCard } from "@/components/shared/DestinationCard";
import { Typography } from "@/components/ui/Typography";
import {
    CATEGORY_DETAILS,
    LIST_TYPES,
    getCategory as categoryFromItem,
} from "@/constants/categories";
import { COLORS, RADIUS, SPACING } from "@/constants/theme";
import type { ItemWithDistance } from "@/services/models/Item";
import type { ListType } from "@/services/storage";
import {
    distanceBetween,
    formatDistance,
    formatTotalDistance,
} from "@/utils/distance";
import { shareText } from "@/utils/shareUtils";
import { generateImportUrl } from "@/utils/cartDeepLink";
import { MaterialIcons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect, useMemo, useRef, useState } from "react";
import {
    Alert,
    Animated,
    PanResponder,
    Pressable,
    ScrollView,
    StyleSheet,
    View,
} from "react-native";
import {
    SafeAreaView,
    useSafeAreaInsets,
} from "react-native-safe-area-context";

const MAX_COMPLEMENTARY_DISTANCE_METERS = 5000;

export default function CartScreen() {
    const cartItems = useAtomValue(cartItemsAtom);
    const availablePlaces = useAtomValue(getAllListDataAtom);
    const favorites = useAtomValue(favoritesAtom);
    const removeItem = useSetAtom(removeCartItemAtom);
    const moveItem = useSetAtom(moveCartItemAtom);
    const clearCart = useSetAtom(clearCartAtom);
    const refreshPlaces = useSetAtom(refreshListDataAtom);
    const toggleFavorite = useSetAtom(toggleFavoriteAtom);
    const insets = useSafeAreaInsets();
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        for (const listType of LIST_TYPES) {
            refreshPlaces(listType);
        }
    }, [refreshPlaces]);

    const summary = useMemo(() => {
        const healthyItems = cartItems.filter(
            ({ item }) => item.keyCalidadSanitaria?.toLowerCase() !== "ns",
        ).length;
        const healthScore = cartItems.length
            ? Math.round((healthyItems / cartItems.length) * 100)
            : 0;
        const estimatedHours = Math.max(1, Math.ceil(cartItems.length * 1.25));

        return {
            healthScore,
            duration: `${estimatedHours}-${estimatedHours + 1} horas`,
            totalDistance: formatTotalDistance(cartItems),
        };
    }, [cartItems]);

    const complementaryLists = useMemo(() => {
        const cartItemKeys = new Set(
            cartItems.map(({ item, category }) => `${category}-${item.id}`),
        );
        const plannedCategories = new Set(
            cartItems.map(({ category }) => category),
        );

        return LIST_TYPES.filter((category) => !plannedCategories.has(category))
            .map((category) => ({
                category,
                places: availablePlaces
                    .filter((place) => categoryFromItem(place) === category)
                    .filter(
                        (place) => !cartItemKeys.has(`${category}-${place.id}`),
                    )
                    .map((place) => ({
                        place,
                        distance: Math.min(
                            ...cartItems.map(({ item }) =>
                                distanceBetween(item, place),
                            ),
                        ),
                    }))
                    .filter(
                        ({ distance }) =>
                            distance <= MAX_COMPLEMENTARY_DISTANCE_METERS,
                    )
                    .sort((first, second) => first.distance - second.distance)
                    .slice(0, 4),
            }))
            .filter(({ places }) => places.length > 0);
    }, [availablePlaces, cartItems]);

    const handleGenerateRoute = () => {
        if (cartItems.length === 0) return;

        const destinations = cartItems
            .map(({ item }) => `${item.strLatitud},${item.strLongitud}`)
            .filter((coordinates) => !coordinates.includes("undefined"));

        if (destinations.length === 0) {
            Alert.alert(
                "Ruta no disponible",
                "No hay coordenadas disponibles para los lugares de tu plan.",
            );
            return;
        }

        const destination = destinations[destinations.length - 1];
        const waypoints = destinations.slice(0, -1).join("|");
        const routeUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}${
            waypoints ? `&waypoints=${encodeURIComponent(waypoints)}` : ""
        }`;
        void Linking.openURL(routeUrl);
    };

    const generateReadableText = () => {
        if (cartItems.length === 0) return "";

        const emojiMap: Record<ListType, string> = {
            beach: "🏖️",
            pool: "🏊",
            hotel: "🏨",
            restaurant: "🍽️",
            tourism: "🗺️",
        };

        const listText = cartItems
            .map(({ item, category }, index) => {
                const emoji = emojiMap[category] || "📍";
                const label = CATEGORY_DETAILS[category]?.label || "";
                return `${index + 1}. ${emoji} ${item.strNombre} (${label})`;
            })
            .join("\n");

        const routeUrl =
            cartItems.length > 0
                ? `https://www.google.com/maps/dir/?api=1&destination=${
                      cartItems[cartItems.length - 1].item.strLatitud
                  },${cartItems[cartItems.length - 1].item.strLongitud}${
                      cartItems.length > 1
                          ? `&waypoints=${encodeURIComponent(
                                cartItems
                                    .slice(0, -1)
                                    .map(({ item }) => `${item.strLatitud},${item.strLongitud}`)
                                    .join("|")
                            )}`
                          : ""
                  }`
                : "";

        return `🌟 Mi Recorrido Saludable - Verano Saludable 🌟

Tengo un plan listo para disfrutar de lugares limpios y sanitarios certificados de DIGESA. ¡Te comparto mi itinerario!

📍 Paradas de mi plan:
${listText}

📊 Resumen de mi recorrido:
• Distancia total: ${summary.totalDistance}
• Duración aproximada: ${summary.duration}
• Puntuación de Bienestar: ${summary.healthScore}%

🗺️ Ruta en Google Maps:
${routeUrl}

✨ ¡Crea tu propia ruta saludable gratis descargando Saludables!`;
    };

    const handleSharePlan = () => {
        if (cartItems.length === 0) return;

        const importUrl = generateImportUrl(cartItems);

        Alert.alert(
            "Compartir mi plan",
            "¿Cómo deseas compartir tu itinerario saludable con tus amigos o familia?",
            [
                {
                    text: "Enlace de Importación Directa",
                    onPress: async () => {
                        const shareMsg = `¡Carga mi itinerario saludable directamente en tu app Saludables!\n\nAbierto desde aquí:\n${importUrl}`;
                        await shareText(shareMsg, importUrl, "Importar plan saludable");
                    },
                },
                {
                    text: "Resumen de Ruta (Texto)",
                    onPress: async () => {
                        const message = generateReadableText();
                        await shareText(message);
                    },
                },
                {
                    text: "Cancelar",
                    style: "cancel",
                },
            ]
        );
    };

    const handleClearPlan = () => {
        Alert.alert(
            "Vaciar mi plan",
            "Se eliminarán todos los lugares de este plan.",
            [
                { text: "Cancelar", style: "cancel" },
                { text: "Vaciar", style: "destructive", onPress: clearCart },
            ],
        );
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
            <StatusBar style="dark" />
            <View style={styles.header}>
                <Pressable
                    onPress={() => {
                        if (router.canGoBack()) {
                            router.back();
                        } else {
                            router.replace("/");
                        }
                    }}
                    style={styles.backButton}
                    accessibilityRole="button"
                    accessibilityLabel="Volver"
                >
                    <MaterialIcons
                        name="arrow-back"
                        size={24}
                        color={COLORS.primary}
                    />
                </Pressable>
                {cartItems.length > 0 && (
                    <Pressable
                        onPress={handleSharePlan}
                        style={styles.shareButton}
                        accessibilityRole="button"
                        accessibilityLabel="Compartir mi plan"
                    >
                        <MaterialIcons
                            name="share"
                            size={23}
                            color={COLORS.primary}
                        />
                    </Pressable>
                )}
            </View>

            <ScrollView
                style={styles.screen}
                scrollEnabled={!isDragging}
                contentContainerStyle={[
                    styles.content,
                    {
                        paddingBottom: cartItems.length
                            ? 185 + insets.bottom
                            : 32,
                    },
                ]}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.titleSection}>
                    <View style={styles.titleRow}>
                        <Typography variant="h2">Mi plan saludable</Typography>
                        {cartItems.length > 0 && (
                            <Pressable onPress={handleClearPlan} hitSlop={10}>
                                <Typography
                                    variant="label"
                                    bold
                                    color={COLORS.primary}
                                >
                                    Vaciar
                                </Typography>
                            </Pressable>
                        )}
                    </View>
                    <View style={styles.planMeta}>
                        <View style={styles.countBadge}>
                            <Typography
                                variant="eyebrow"
                                style={styles.countText}
                            >
                                {cartItems.length}{" "}
                                {cartItems.length === 1
                                    ? "lugar añadido"
                                    : "lugares añadidos"}
                            </Typography>
                        </View>
                        <Typography variant="label" bold>
                            Tu recorrido de bienestar
                        </Typography>
                    </View>
                </View>

                {cartItems.length === 0 ? (
                    <EmptyPlan />
                ) : (
                    <>
                        <View style={styles.itemsList}>
                            {cartItems.map((cartItem, index) => (
                                <DraggablePlanItem
                                    key={`${cartItem.category}-${cartItem.item.id}`}
                                    cartItem={cartItem}
                                    index={index}
                                    itemCount={cartItems.length}
                                    onMove={(fromIndex, toIndex) =>
                                        moveItem(fromIndex, toIndex)
                                    }
                                    onRemove={() =>
                                        removeItem(
                                            cartItem.item.id,
                                            cartItem.category,
                                        )
                                    }
                                    onDragStart={() => setIsDragging(true)}
                                    onDragEnd={() => setIsDragging(false)}
                                />
                            ))}
                        </View>

                        <Pressable
                            style={styles.addMoreCard}
                            onPress={() => router.replace("/")}
                            accessibilityRole="button"
                        >
                            <MaterialIcons
                                name="add-circle-outline"
                                size={30}
                                color={COLORS.muted}
                            />
                            <Typography
                                variant="body"
                                bold
                                color={COLORS.muted}
                            >
                                Añadir más lugares saludables
                            </Typography>
                        </Pressable>

                        {complementaryLists.length > 0 && (
                            <View style={styles.complementarySection}>
                                <Typography
                                    variant="h2"
                                    style={styles.complementaryTitle}
                                >
                                    Completa tu recorrido
                                </Typography>
                                <Typography
                                    variant="body"
                                    color={COLORS.muted}
                                    style={styles.complementaryCopy}
                                >
                                    Opciones que complementan tu plan, a menos
                                    de 5 km de alguno de tus lugares.
                                </Typography>
                                {complementaryLists.map(
                                    ({ category, places }) => (
                                        <View
                                            key={category}
                                            style={styles.complementaryRail}
                                        >
                                            <View
                                                style={
                                                    styles.complementaryRailHeading
                                                }
                                            >
                                                <MaterialIcons
                                                    name={
                                                        CATEGORY_DETAILS[
                                                            category
                                                        ].icon
                                                    }
                                                    size={20}
                                                    color={COLORS.primary}
                                                />
                                                <Typography variant="h3">
                                                    {
                                                        CATEGORY_DETAILS[
                                                            category
                                                        ].label
                                                    }
                                                    s cerca de tu plan
                                                </Typography>
                                            </View>
                                            <ScrollView
                                                horizontal
                                                showsHorizontalScrollIndicator={
                                                    false
                                                }
                                                contentContainerStyle={
                                                    styles.recommendationList
                                                }
                                            >
                                                {places.map(({ place }) => (
                                                    <View
                                                        key={`${category}-${place.id}`}
                                                        style={
                                                            styles.recommendationCard
                                                        }
                                                    >
                                                        <DestinationCard
                                                            item={place}
                                                            category={category}
                                                            isFavorite={favorites.includes(
                                                                place.id,
                                                            )}
                                                            onToggleFavorite={() =>
                                                                toggleFavorite(
                                                                    place.id,
                                                                )
                                                            }
                                                            onPress={() =>
                                                                router.push({
                                                                    pathname:
                                                                        "/[id]",
                                                                    params: {
                                                                        id: place.id,
                                                                        type: category,
                                                                    },
                                                                })
                                                            }
                                                        />
                                                    </View>
                                                ))}
                                            </ScrollView>
                                        </View>
                                    ),
                                )}
                            </View>
                        )}
                    </>
                )}
            </ScrollView>

            {cartItems.length > 0 && (
                <View
                    style={[
                        styles.actionBar,
                        { paddingBottom: Math.max(insets.bottom, SPACING.md) },
                    ]}
                >
                    <View style={styles.compactSummaryContainer}>
                        <View style={styles.compactMetricItem}>
                            <MaterialIcons
                                name="schedule"
                                size={18}
                                color={COLORS.primary}
                                style={styles.compactMetricIcon}
                            />
                            <View>
                                <Typography
                                    variant="eyebrow"
                                    style={styles.compactMetricLabel}
                                >
                                    Duración
                                </Typography>
                                <Typography
                                    variant="label"
                                    bold
                                    style={styles.compactMetricValue}
                                >
                                    {summary.duration}
                                </Typography>
                            </View>
                        </View>

                        <View style={styles.compactDivider} />

                        <View style={styles.compactMetricItem}>
                            <MaterialIcons
                                name="route"
                                size={18}
                                color={COLORS.primary}
                                style={styles.compactMetricIcon}
                            />
                            <View>
                                <Typography
                                    variant="eyebrow"
                                    style={styles.compactMetricLabel}
                                >
                                    Distancia
                                </Typography>
                                <Typography
                                    variant="label"
                                    bold
                                    style={styles.compactMetricValue}
                                >
                                    {summary.totalDistance}
                                </Typography>
                            </View>
                        </View>

                        <View style={styles.compactDivider} />

                        <View style={styles.compactMetricItem}>
                            <MaterialIcons
                                name="eco"
                                size={18}
                                color={COLORS.success}
                                style={styles.compactMetricIcon}
                            />
                            <View>
                                <Typography
                                    variant="eyebrow"
                                    style={styles.compactMetricLabel}
                                >
                                    Bienestar
                                </Typography>
                                <Typography
                                    variant="label"
                                    bold
                                    color={COLORS.success}
                                    style={styles.compactMetricValue}
                                >
                                    {summary.healthScore}%
                                </Typography>
                            </View>
                        </View>
                    </View>

                    <Pressable
                        style={styles.routeButton}
                        onPress={handleGenerateRoute}
                        accessibilityRole="button"
                    >
                        <MaterialIcons
                            name="directions-run"
                            size={23}
                            color={COLORS.white}
                        />
                        <Typography variant="body" bold color={COLORS.white}>
                            Generar ruta
                        </Typography>
                    </Pressable>
                </View>
            )}
        </SafeAreaView>
    );
}

function EmptyPlan() {
    return (
        <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
                <MaterialIcons
                    name="add-location-alt"
                    size={38}
                    color={COLORS.primary}
                />
            </View>
            <Typography variant="h3" style={styles.emptyTitle}>
                Tu plan empieza aquí
            </Typography>
            <Typography
                variant="body"
                color={COLORS.muted}
                style={styles.emptyCopy}
            >
                Añade playas, restaurantes, hospedajes y otros lugares para
                crear tu ruta saludable.
            </Typography>
            <Pressable
                style={styles.exploreButton}
                onPress={() => router.replace("/")}
            >
                <MaterialIcons name="explore" size={19} color={COLORS.white} />
                <Typography variant="body" bold color={COLORS.white}>
                    Explorar lugares
                </Typography>
            </Pressable>
        </View>
    );
}

function DraggablePlanItem({
    cartItem,
    index,
    itemCount,
    onMove,
    onRemove,
    onDragStart,
    onDragEnd,
}: {
    cartItem: CartItem;
    index: number;
    itemCount: number;
    onMove: (fromIndex: number, toIndex: number) => void;
    onRemove: () => void;
    onDragStart: () => void;
    onDragEnd: () => void;
}) {
    const { item, category } = cartItem;
    const details = CATEGORY_DETAILS[category];
    const location =
        [item.strDistrito, item.strProvincia].filter(Boolean).join(", ") ||
        "Perú";
    const translateY = useRef(new Animated.Value(0)).current;
    const rowHeight = useRef(132);
    const indexRef = useRef(index);
    const itemCountRef = useRef(itemCount);
    const onMoveRef = useRef(onMove);
    const onDragStartRef = useRef(onDragStart);
    const onDragEndRef = useRef(onDragEnd);
    const [isDragging, setIsDragging] = useState(false);

    indexRef.current = index;
    itemCountRef.current = itemCount;
    onMoveRef.current = onMove;
    onDragStartRef.current = onDragStart;
    onDragEndRef.current = onDragEnd;

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: () => {
                setIsDragging(true);
                onDragStartRef.current();
            },
            onPanResponderMove: (_event, gesture) =>
                translateY.setValue(gesture.dy),
            onPanResponderRelease: (_event, gesture) => {
                const movement = Math.round(gesture.dy / rowHeight.current);
                const destinationIndex = Math.max(
                    0,
                    Math.min(
                        itemCountRef.current - 1,
                        indexRef.current + movement,
                    ),
                );
                Animated.spring(translateY, {
                    toValue: 0,
                    useNativeDriver: true,
                }).start(() => {
                    setIsDragging(false);
                    onMoveRef.current(indexRef.current, destinationIndex);
                    onDragEndRef.current();
                });
            },
            onPanResponderTerminate: () => {
                Animated.spring(translateY, {
                    toValue: 0,
                    useNativeDriver: true,
                }).start();
                setIsDragging(false);
                onDragEndRef.current();
            },
        }),
    ).current;

    return (
        <Animated.View
            style={[
                styles.dragItem,
                isDragging && styles.dragItemActive,
                { transform: [{ translateY }] },
            ]}
            onLayout={(event) => {
                rowHeight.current =
                    event.nativeEvent.layout.height + SPACING.lg;
            }}
        >
            <View style={styles.planCard}>
                <View
                    {...panResponder.panHandlers}
                    style={styles.dragHandle}
                    accessibilityLabel="Mantén pulsado y arrastra para ordenar"
                >
                    <MaterialIcons
                        name="drag-indicator"
                        size={24}
                        color="#B9AEAC"
                    />
                </View>
                <RemoteListImage
                    category={category}
                    source={item.urlFoto}
                    style={styles.itemImage}
                />
                <Pressable
                    style={styles.itemContent}
                    onPress={() =>
                        router.push({
                            pathname: "/[id]",
                            params: { id: item.id, type: category },
                        })
                    }
                    accessibilityRole="button"
                    accessibilityLabel={`Ver detalles de ${item.strNombre}`}
                >
                    <View style={styles.itemTopline}>
                        <View style={styles.categoryBadge}>
                            <MaterialIcons
                                name={details.icon}
                                size={12}
                                color={COLORS.primary}
                            />
                            <Typography
                                variant="eyebrow"
                                style={styles.categoryText}
                            >
                                {details.label}
                            </Typography>
                        </View>
                        <View style={styles.distanceRow}>
                            <MaterialIcons
                                name="near-me"
                                size={13}
                                color={COLORS.muted}
                            />
                            <Typography variant="label" bold>
                                {formatDistance(item.distance)}
                            </Typography>
                        </View>
                    </View>
                    <Typography
                        variant="body"
                        bold
                        numberOfLines={1}
                        style={styles.itemTitle}
                    >
                        {item.strNombre}
                    </Typography>
                    <Typography variant="label" numberOfLines={1}>
                        {location}
                    </Typography>
                </Pressable>
                <Pressable
                    onPress={onRemove}
                    style={styles.deleteButton}
                    accessibilityRole="button"
                    accessibilityLabel={`Quitar ${item.strNombre} del plan`}
                >
                    <MaterialIcons
                        name="delete-outline"
                        size={23}
                        color={COLORS.primary}
                    />
                </Pressable>
            </View>
        </Animated.View>
    );
}

function SummaryMetric({
    icon,
    label,
    value,
}: {
    icon: "schedule" | "route";
    label: string;
    value: string;
}) {
    return (
        <View style={styles.metricCard}>
            <MaterialIcons name={icon} size={24} color={COLORS.primary} />
            <Typography variant="eyebrow" style={styles.metricLabel}>
                {label}
            </Typography>
            <Typography
                variant="h3"
                numberOfLines={1}
                style={styles.metricValue}
            >
                {value}
            </Typography>
        </View>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: COLORS.background },
    screen: { flex: 1 },
    content: { paddingHorizontal: SPACING.xl },
    header: {
        height: 62,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: SPACING.xl,
        marginTop: SPACING.sm,
    },
    backButton: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: COLORS.palePrimary,
        alignItems: "center",
        justifyContent: "center",
    },
    shareButton: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: COLORS.palePrimary,
        alignItems: "center",
        justifyContent: "center",
    },
    titleSection: { paddingTop: SPACING.xxl, paddingBottom: SPACING.xl },
    titleRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        gap: SPACING.md,
    },
    planMeta: {
        flexDirection: "row",
        alignItems: "center",
        gap: SPACING.md,
        marginTop: SPACING.sm,
    },
    countBadge: {
        backgroundColor: COLORS.palePrimary,
        paddingHorizontal: SPACING.md,
        paddingVertical: 6,
        borderRadius: RADIUS.xl,
    },
    countText: { color: "#760012", fontSize: 9 },
    itemsList: { gap: SPACING.lg },
    dragItem: { zIndex: 0 },
    dragItemActive: { zIndex: 10, opacity: 0.96 },
    planCard: {
        minHeight: 116,
        flexDirection: "row",
        alignItems: "center",
        padding: SPACING.md,
        borderRadius: RADIUS.xl,
        backgroundColor: COLORS.surface,
        shadowColor: "#1D3557",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 14,
        elevation: 2,
    },
    dragHandle: {
        width: 28,
        minHeight: 80,
        alignItems: "center",
        justifyContent: "center",
        marginRight: SPACING.sm,
    },
    itemImage: { width: 80, height: 80, borderRadius: RADIUS.md },
    itemContent: { flex: 1, minWidth: 0, marginLeft: SPACING.md },
    itemTopline: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 5,
    },
    categoryBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 3,
        maxWidth: "58%",
        paddingHorizontal: 6,
        paddingVertical: 4,
        borderRadius: RADIUS.sm,
        backgroundColor: "#FFF2F3",
    },
    categoryText: { fontSize: 8, letterSpacing: 0.7 },
    distanceRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 2,
        flexShrink: 1,
    },
    itemTitle: { marginTop: 8, fontSize: 16 },
    deleteButton: { marginLeft: 4, padding: 8 },
    addMoreCard: {
        minHeight: 132,
        marginTop: SPACING.lg,
        borderWidth: 2,
        borderStyle: "dashed",
        borderColor: COLORS.line,
        borderRadius: RADIUS.xl,
        alignItems: "center",
        justifyContent: "center",
        gap: SPACING.sm,
    },
    summarySection: { marginTop: 42 },
    summaryTitle: { marginBottom: SPACING.lg },
    metricsRow: { flexDirection: "row", gap: SPACING.lg },
    metricCard: {
        flex: 1,
        minHeight: 142,
        padding: SPACING.lg,
        borderRadius: RADIUS.xxl,
        backgroundColor: "#F1F2F3",
        justifyContent: "center",
    },
    metricLabel: { marginTop: SPACING.lg, fontSize: 9, color: COLORS.muted },
    metricValue: { marginTop: 4, fontSize: 20 },
    scoreCard: {
        flexDirection: "row",
        alignItems: "center",
        minHeight: 112,
        marginTop: SPACING.lg,
        padding: SPACING.lg,
        borderWidth: 1,
        borderColor: "#F5CACC",
        borderRadius: RADIUS.xxl,
        backgroundColor: "#FFF7F7",
    },
    scoreIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: COLORS.primary,
    },
    scoreCopy: { flex: 1, marginLeft: SPACING.md, marginRight: SPACING.sm },
    complementarySection: { marginTop: 42 },
    complementaryTitle: { marginBottom: SPACING.sm },
    complementaryCopy: { lineHeight: 21 },
    complementaryRail: { marginTop: SPACING.xl },
    complementaryRailHeading: {
        flexDirection: "row",
        alignItems: "center",
        gap: SPACING.sm,
        marginBottom: SPACING.md,
    },
    recommendationList: { gap: SPACING.md, paddingRight: SPACING.xl },
    recommendationCard: { width: 244 },
    actionBar: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        paddingHorizontal: SPACING.xl,
        paddingTop: SPACING.md,
        backgroundColor: "rgba(248,249,250,0.96)",
    },
    compactSummaryContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.line,
        borderRadius: RADIUS.xl,
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.md,
        marginBottom: SPACING.md,
        shadowColor: COLORS.secondary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    compactMetricItem: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 4,
    },
    compactMetricIcon: {
        alignSelf: "center",
    },
    compactMetricLabel: {
        color: COLORS.muted,
        fontSize: 8,
        letterSpacing: 0.5,
        textTransform: "uppercase",
    },
    compactMetricValue: {
        fontSize: 12,
        marginTop: 1,
    },
    compactDivider: {
        width: 1,
        height: 24,
        backgroundColor: COLORS.line,
    },
    routeButton: {
        height: 58,
        borderRadius: 29,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: SPACING.sm,
        backgroundColor: COLORS.primary,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.22,
        shadowRadius: 12,
        elevation: 4,
    },
    emptyState: {
        marginTop: SPACING.xl,
        paddingVertical: 48,
        paddingHorizontal: SPACING.xxl,
        alignItems: "center",
        borderRadius: RADIUS.xxl,
        backgroundColor: COLORS.surface,
    },
    emptyIcon: {
        width: 78,
        height: 78,
        borderRadius: 39,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: COLORS.palePrimary,
    },
    emptyTitle: { marginTop: SPACING.lg, textAlign: "center" },
    emptyCopy: { marginTop: SPACING.sm, textAlign: "center", lineHeight: 21 },
    exploreButton: {
        height: 48,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: SPACING.sm,
        marginTop: SPACING.xl,
        paddingHorizontal: SPACING.lg,
        borderRadius: 24,
        backgroundColor: COLORS.primary,
    },
});
