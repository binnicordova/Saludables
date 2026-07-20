import { addCartItemAtom, isCartItemAtom } from "@/atoms/cart";
import {
    favoritesAtom,
    getAllListDataAtom,
    refreshListDataAtom,
    toggleFavoriteAtom,
} from "@/atoms/listAtom";
import RemoteListImage from "@/components/RemoteListImage";
import { Section } from "@/components/layout/Section";
import { DestinationCard } from "@/components/shared/DestinationCard";
import { CircleButton } from "@/components/ui/CircleButton";
import { Typography } from "@/components/ui/Typography";
import {
    LIST_TYPES,
    CATEGORY_DETAILS as categoryDetails,
    COMPLEMENTARY_COPY as complementaryCopy,
    COMPLEMENTARY_TITLES as complementaryTitles,
    getCategory,
} from "@/constants/categories";
import { COLORS, RADIUS, SPACING } from "@/constants/theme";
import type { ItemWithDistance } from "@/services/models/Item";
import type { ListType } from "@/services/storage";
import { distanceBetween, formatDistance } from "@/utils/distance";
import { shareText } from "@/utils/shareUtils";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Linking from "expo-linking";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect, useMemo, useRef } from "react";
import {
    ActivityIndicator,
    Animated,
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

type ComplementaryList = {
    category: ListType;
    places: ItemWithDistance[];
    isFallback: boolean;
};

export default function DestinationDetailScreen() {
    const { id, type } = useLocalSearchParams<{
        id: string | string[];
        type?: string | string[];
    }>();
    const itemId = Array.isArray(id) ? id[0] : id;
    const requestedCategory = Array.isArray(type) ? type[0] : type;
    const places = useAtomValue(getAllListDataAtom);
    const favorites = useAtomValue(favoritesAtom);
    const toggleFavorite = useSetAtom(toggleFavoriteAtom);
    const isInCart = useAtomValue(isCartItemAtom);
    const addCartItem = useSetAtom(addCartItemAtom);
    const refresh = useSetAtom(refreshListDataAtom);
    const insets = useSafeAreaInsets();
    const scrollY = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        for (const list of LIST_TYPES) {
            refresh(list);
        }
    }, [refresh]);

    const selectedPlace = useMemo(
        () =>
            places.find(
                (place) =>
                    place.id === itemId &&
                    (!requestedCategory ||
                        getCategory(place) === requestedCategory),
            ) ?? places.find((place) => place.id === itemId),
        [itemId, places, requestedCategory],
    );

    const selectedCategory = useMemo<ListType>(() => {
        return LIST_TYPES.includes(requestedCategory as ListType)
            ? (requestedCategory as ListType)
            : selectedPlace
              ? getCategory(selectedPlace)
              : "tourism";
    }, [requestedCategory, selectedPlace]);

    const complementaryLists = useMemo<ComplementaryList[]>(() => {
        if (!selectedPlace) return [];

        const listsWithinFiveKilometers = LIST_TYPES.filter(
            (category) => category !== selectedCategory,
        )
            .map((category) => ({
                category,
                isFallback: false,
                places: places
                    .filter(
                        (place) =>
                            getCategory(place) === category &&
                            !(
                                place.id === selectedPlace.id &&
                                getCategory(place) === selectedCategory
                            ),
                    )
                    .map((place) => {
                        const distance = distanceBetween(selectedPlace, place);
                        return { ...place, distance };
                    })
                    .filter(
                        (place) =>
                            Number.isFinite(place.distance) &&
                            place.distance <= MAX_COMPLEMENTARY_DISTANCE_METERS,
                    )
                    .sort(
                        (first, second) =>
                            (first.distance ?? 0) - (second.distance ?? 0),
                    )
                    .slice(0, 6),
            }))
            .filter(({ places }) => places.length > 0);

        if (listsWithinFiveKilometers.length > 0) {
            return listsWithinFiveKilometers;
        }

        const alternatives = places
            .filter(
                (place) =>
                    getCategory(place) === selectedCategory &&
                    place.id !== selectedPlace.id,
            )
            .map((place) => {
                const distance = distanceBetween(selectedPlace, place);
                return { ...place, distance };
            })
            .filter(
                (place) =>
                    Number.isFinite(place.distance) &&
                    place.distance <= MAX_COMPLEMENTARY_DISTANCE_METERS,
            )
            .sort(
                (first, second) =>
                    (first.distance ?? 0) - (second.distance ?? 0),
            )
            .slice(0, 6);

        return alternatives.length > 0
            ? [
                  {
                      category: selectedCategory,
                      places: alternatives,
                      isFallback: true,
                  },
              ]
            : [];
    }, [places, selectedCategory, selectedPlace]);

    const goBack = () => {
        if (router.canGoBack()) router.back();
        else router.replace("/");
    };

    if (!selectedPlace) {
        return (
            <SafeAreaView style={styles.loadingScreen}>
                <StatusBar style="dark" />
                <ActivityIndicator color={COLORS.primary} size="large" />
                <Typography variant="h3" style={styles.loadingTitle}>
                    Buscando el lugar...
                </Typography>
                <Typography
                    variant="body"
                    color={COLORS.muted}
                    style={styles.loadingCopy}
                >
                    Estamos cargando la información más reciente.
                </Typography>
                <Pressable onPress={goBack} style={styles.backToExplore}>
                    <Typography variant="body" bold color={COLORS.primary}>
                        Volver a explorar
                    </Typography>
                </Pressable>
            </SafeAreaView>
        );
    }

    const isHealthy = selectedPlace.keyCalidadSanitaria?.toLowerCase() !== "ns";
    const location = [
        selectedPlace.strDistrito,
        selectedPlace.strProvincia,
        selectedPlace.strDepartamento,
    ]
        .filter(Boolean)
        .join(", ");
    const isFavorite = favorites.includes(selectedPlace.id);
    const isAddedToPlan = isInCart(selectedPlace.id, selectedCategory);
    const category = categoryDetails[selectedCategory];
    const routeUrl =
        selectedPlace.mapUrl ??
        `https://www.google.com/maps/dir/?api=1&destination=${selectedPlace.strLatitud},${selectedPlace.strLongitud}`;

    const openRoute = () => {
        void Linking.openURL(routeUrl);
    };

    const addToPlan = () => {
        addCartItem(selectedPlace, selectedCategory);
        router.push("/cart");
    };

    const sharePlace = () => {
        void shareText(
            `Conoce ${selectedPlace.strNombre} en Saludables. ${location || "Perú"}.`,
            routeUrl,
            selectedPlace.strNombre,
        );
    };

    const translateY = scrollY.interpolate({
        inputRange: [0, 414],
        outputRange: [0, 165.6], // travels offset by 40% (slower scroll)
        extrapolate: "clamp",
    });

    const scale = scrollY.interpolate({
        inputRange: [-200, 0],
        outputRange: [1.3, 1], // stretch/zoom effect on scroll-down pull
        extrapolateRight: "clamp",
    });

    return (
        <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
            <StatusBar style="light" />
            <Animated.ScrollView
                style={styles.screen}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
                scrollEventThrottle={16}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: true },
                )}
            >
                <View style={styles.hero}>
                    <Animated.View
                        style={[
                            StyleSheet.absoluteFill,
                            {
                                transform: [{ translateY }, { scale }],
                            },
                        ]}
                    >
                        <RemoteListImage
                            category={selectedCategory}
                            source={selectedPlace.urlFoto}
                            style={styles.heroImage}
                        />
                        <LinearGradient
                            colors={[
                                "rgba(18, 23, 24, 0.38)",
                                "transparent",
                                "rgba(18, 23, 24, 0.86)",
                            ]}
                            locations={[0, 0.4, 1]}
                            style={StyleSheet.absoluteFill}
                        />
                    </Animated.View>
                    <View style={[styles.toolbar, { top: 16 + insets.top }]}>
                        <CircleButton
                            icon="arrow-back"
                            label="Volver"
                            onPress={goBack}
                        />
                        <View style={styles.toolbarActions}>
                            <CircleButton
                                icon="shopping-basket"
                                label="Ver mi plan"
                                onPress={() => router.push("/cart")}
                            />
                            <CircleButton
                                icon="share"
                                label="Compartir"
                                onPress={sharePlace}
                            />
                            <CircleButton
                                icon={
                                    isFavorite ? "favorite" : "favorite-border"
                                }
                                label={
                                    isFavorite
                                        ? "Quitar de guardados"
                                        : "Guardar lugar"
                                }
                                onPress={() => toggleFavorite(selectedPlace.id)}
                            />
                        </View>
                    </View>
                    <View style={styles.heroCopy}>
                        <View
                            style={[
                                styles.healthBadge,
                                !isHealthy && styles.reviewBadge,
                            ]}
                        >
                            <MaterialIcons
                                name="verified-user"
                                size={15}
                                color={COLORS.white}
                            />
                            <Typography
                                variant="label"
                                bold
                                color={COLORS.white}
                                style={styles.healthBadgeText}
                            >
                                {isHealthy
                                    ? "SALUDABLE"
                                    : "PENDIENTE DE REVISIÓN"}
                            </Typography>
                        </View>
                        <Typography
                            variant="h1"
                            color={COLORS.white}
                            style={styles.heroTitle}
                        >
                            {selectedPlace.strNombre}
                        </Typography>
                        <View style={styles.locationRow}>
                            <MaterialIcons
                                name="location-on"
                                size={17}
                                color={COLORS.white}
                            />
                            <Typography
                                variant="bodySmall"
                                color={COLORS.white}
                                numberOfLines={1}
                            >
                                {location || "Perú"}
                            </Typography>
                            <View style={styles.dot} />
                            <MaterialIcons
                                name={category.icon}
                                size={16}
                                color={COLORS.white}
                            />
                            <Typography
                                variant="bodySmall"
                                color={COLORS.white}
                                numberOfLines={1}
                            >
                                {category.label}
                            </Typography>
                        </View>
                    </View>
                </View>

                <View style={styles.metrics}>
                    <Metric
                        icon="near-me"
                        value={formatDistance(
                            selectedPlace.distance ?? Number.POSITIVE_INFINITY,
                        )}
                        label="DISTANCIA"
                    />
                    <Metric
                        icon="water-drop"
                        value={isHealthy ? "Apta" : "Revisar"}
                        label="CALIDAD"
                    />
                    <Metric
                        icon="category"
                        value={category.label}
                        label="TIPO"
                    />
                </View>

                <View style={styles.details}>
                    <Section title={`Sobre ${selectedPlace.strNombre}`}>
                        <Typography
                            variant="body"
                            color={COLORS.muted}
                            style={styles.description}
                        >
                            {selectedPlace.strDescripcion ||
                                "Consulta la información sanitaria y planifica una visita segura a este destino."}
                        </Typography>
                    </Section>

                    <View style={styles.safetyCard}>
                        <View style={styles.safetyHeading}>
                            <MaterialIcons
                                name="health-and-safety"
                                size={23}
                                color={COLORS.primary}
                            />
                            <Typography variant="h3">
                                Salud y seguridad
                            </Typography>
                        </View>
                        <InfoRow
                            icon="verified-user"
                            label="Calidad sanitaria"
                            value={
                                selectedPlace.strCalidadSanitaria ||
                                (isHealthy ? "Verificada" : "En revisión")
                            }
                            highlighted={isHealthy}
                        />
                        <InfoRow
                            icon="calendar-today"
                            label="Última inspección"
                            value={
                                selectedPlace.strUltimaInspeccion ||
                                selectedPlace.dateUltimaInspeccion ||
                                "No disponible"
                            }
                        />
                        <InfoRow
                            icon="place"
                            label="Dirección"
                            value={
                                selectedPlace.strDireccion ||
                                location ||
                                "No disponible"
                            }
                        />
                    </View>
                </View>

                {complementaryLists.length > 0 && (
                    <View style={styles.complementarySection}>
                        <Section
                            title={
                                complementaryLists[0]?.isFallback
                                    ? "Alternativas cerca de ti"
                                    : "Complementa tu experiencia"
                            }
                        >
                            <Typography
                                variant="body"
                                color={COLORS.muted}
                                style={styles.complementaryDescription}
                            >
                                {complementaryLists[0]?.isFallback
                                    ? `Descubre otras opciones de ${categoryDetails[selectedCategory].label.toLowerCase()} a menos de 5 km.`
                                    : `${complementaryCopy[selectedCategory]} a menos de 5 km.`}
                            </Typography>
                        </Section>
                        {complementaryLists.map(
                            ({
                                category: nearbyCategory,
                                places: categoryPlaces,
                                isFallback,
                            }) => (
                                <View
                                    key={nearbyCategory}
                                    style={styles.complementaryRail}
                                >
                                    <View
                                        style={styles.complementaryRailHeading}
                                    >
                                        <View
                                            style={
                                                styles.complementaryRailTitle
                                            }
                                        >
                                            <MaterialIcons
                                                name={
                                                    categoryDetails[
                                                        nearbyCategory
                                                    ].icon
                                                }
                                                size={19}
                                                color={COLORS.primary}
                                            />
                                            <Typography variant="h3">
                                                {isFallback
                                                    ? `Más ${complementaryTitles[nearbyCategory].toLowerCase()}`
                                                    : complementaryTitles[
                                                          nearbyCategory
                                                      ]}
                                            </Typography>
                                        </View>
                                        <Typography
                                            variant="label"
                                            bold
                                            color={COLORS.primary}
                                        >
                                            {categoryPlaces.length} opciones
                                        </Typography>
                                    </View>
                                    <ScrollView
                                        horizontal
                                        showsHorizontalScrollIndicator={false}
                                        contentContainerStyle={
                                            styles.nearbyList
                                        }
                                    >
                                        {categoryPlaces.map((place) => (
                                            <View
                                                key={`${nearbyCategory}-${place.id}`}
                                                style={
                                                    styles.recommendationCard
                                                }
                                            >
                                                <DestinationCard
                                                    item={place}
                                                    category={nearbyCategory}
                                                    isFavorite={favorites.includes(
                                                        place.id,
                                                    )}
                                                    onToggleFavorite={() =>
                                                        toggleFavorite(place.id)
                                                    }
                                                    onPress={() =>
                                                        router.push({
                                                            pathname: "/[id]",
                                                            params: {
                                                                id: place.id,
                                                                type: nearbyCategory,
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
            </Animated.ScrollView>

            <View style={styles.routeBar}>
                <Pressable
                    style={styles.mapButton}
                    onPress={openRoute}
                    accessibilityRole="button"
                    accessibilityLabel="Cómo llegar"
                >
                    <MaterialIcons
                        name="route"
                        size={23}
                        color={COLORS.primary}
                    />
                </Pressable>
                <Pressable
                    style={styles.routeButton}
                    onPress={addToPlan}
                    accessibilityRole="button"
                >
                    <MaterialIcons
                        name={
                            isAddedToPlan
                                ? "shopping-basket"
                                : "add-location-alt"
                        }
                        size={23}
                        color={COLORS.white}
                    />
                    <Typography variant="body" bold color={COLORS.white}>
                        {isAddedToPlan ? "Ver mi plan" : "Añadir a mi plan"}
                    </Typography>
                </Pressable>
            </View>
        </SafeAreaView>
    );
}

function Metric({
    icon,
    value,
    label,
}: {
    icon: "near-me" | "water-drop" | "category";
    value: string;
    label: string;
}) {
    return (
        <View style={styles.metric}>
            <MaterialIcons name={icon} size={22} color={COLORS.primary} />
            <Typography
                variant="h3"
                numberOfLines={1}
                style={styles.metricValue}
            >
                {value}
            </Typography>
            <Typography variant="eyebrow" style={styles.metricLabel}>
                {label}
            </Typography>
        </View>
    );
}

function InfoRow({
    icon,
    label,
    value,
    highlighted = false,
}: {
    icon: "verified-user" | "calendar-today" | "place";
    label: string;
    value: string;
    highlighted?: boolean;
}) {
    return (
        <View style={styles.infoRow}>
            <MaterialIcons name={icon} size={19} color={COLORS.muted} />
            <Typography variant="bodySmall" style={styles.infoLabel}>
                {label}
            </Typography>
            <Typography
                variant="bodySmall"
                bold={highlighted}
                color={highlighted ? COLORS.success : COLORS.ink}
                numberOfLines={2}
                style={styles.infoValue}
            >
                {value}
            </Typography>
        </View>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: COLORS.background },
    screen: { flex: 1 },
    content: { paddingBottom: 104 },
    hero: {
        height: 414,
        overflow: "hidden",
        backgroundColor: COLORS.secondary,
    },
    heroImage: { ...StyleSheet.absoluteFill, width: "100%", height: "100%" },
    toolbar: {
        position: "absolute",
        top: 16,
        left: SPACING.xl,
        right: SPACING.xl,
        flexDirection: "row",
        justifyContent: "space-between",
    },
    toolbarActions: { flexDirection: "row", gap: SPACING.sm },
    heroCopy: {
        position: "absolute",
        bottom: SPACING.xl,
        left: SPACING.xl,
        right: SPACING.xl,
    },
    healthBadge: {
        alignSelf: "flex-start",
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        paddingHorizontal: SPACING.md,
        paddingVertical: 5,
        borderRadius: RADIUS.xl,
        backgroundColor: COLORS.success,
        marginBottom: SPACING.sm,
    },
    reviewBadge: { backgroundColor: COLORS.primary },
    healthBadgeText: { fontSize: 10, letterSpacing: 0.5 },
    heroTitle: { fontSize: 29, lineHeight: 35, marginBottom: SPACING.sm },
    locationRow: { flexDirection: "row", alignItems: "center", gap: 4 },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: "rgba(255,255,255,0.65)",
        marginHorizontal: 3,
    },
    metrics: {
        flexDirection: "row",
        gap: SPACING.sm,
        paddingHorizontal: SPACING.xl,
        marginTop: SPACING.xxl,
    },
    metric: {
        flex: 1,
        minHeight: 104,
        borderRadius: RADIUS.xl,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 4,
        backgroundColor: "#F1F2F3",
    },
    metricValue: {
        fontSize: 18,
        lineHeight: 24,
        marginTop: SPACING.xs,
        textAlign: "center",
    },
    metricLabel: { fontSize: 9, marginTop: 2, textAlign: "center" },
    details: { paddingHorizontal: 0 },
    description: {
        paddingHorizontal: SPACING.xl,
        fontSize: 15,
        lineHeight: 23,
    },
    safetyCard: {
        marginHorizontal: SPACING.xl,
        marginTop: SPACING.xxl,
        padding: SPACING.lg,
        borderRadius: RADIUS.xxl,
        backgroundColor: "#EEF0F1",
    },
    safetyHeading: {
        flexDirection: "row",
        alignItems: "center",
        gap: SPACING.sm,
        marginBottom: SPACING.sm,
    },
    infoRow: {
        minHeight: 48,
        flexDirection: "row",
        alignItems: "center",
        gap: SPACING.sm,
        borderTopWidth: 1,
        borderTopColor: "rgba(104,90,88,0.12)",
        paddingVertical: SPACING.sm,
    },
    infoLabel: { flex: 1, color: COLORS.muted },
    infoValue: { flex: 1.2, textAlign: "right" },
    complementarySection: { marginTop: SPACING.sm },
    complementaryDescription: {
        paddingHorizontal: SPACING.xl,
        fontSize: 14,
        lineHeight: 21,
    },
    complementaryRail: { marginTop: SPACING.xl },
    complementaryRailHeading: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: SPACING.xl,
        marginBottom: SPACING.md,
    },
    complementaryRailTitle: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
        gap: SPACING.sm,
    },
    nearbyList: {
        paddingHorizontal: SPACING.xl,
        gap: SPACING.md,
        paddingBottom: SPACING.sm,
    },
    recommendationCard: { width: 244 },
    routeBar: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        flexDirection: "row",
        gap: SPACING.sm,
        paddingHorizontal: SPACING.xl,
        paddingTop: SPACING.lg,
        paddingBottom: SPACING.xl,
        backgroundColor: "rgba(248,249,250,0.96)",
    },
    mapButton: {
        width: 58,
        height: 58,
        borderRadius: 29,
        borderWidth: 1,
        borderColor: COLORS.line,
        backgroundColor: COLORS.surface,
        alignItems: "center",
        justifyContent: "center",
    },
    routeButton: {
        flex: 1,
        height: 58,
        borderRadius: 29,
        backgroundColor: COLORS.primary,
        flexDirection: "row",
        gap: SPACING.sm,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.22,
        shadowRadius: 12,
        elevation: 4,
    },
    loadingScreen: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: SPACING.xxxl,
        backgroundColor: COLORS.background,
    },
    loadingTitle: { marginTop: SPACING.xl, textAlign: "center" },
    loadingCopy: { marginTop: SPACING.sm, textAlign: "center" },
    backToExplore: { marginTop: SPACING.xxl, padding: SPACING.md },
});
