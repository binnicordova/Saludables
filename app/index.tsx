import {
    beachDownloadStateAtom,
    favoritesAtom,
    filterValueAtom,
    getBeachListDataAtom,
    getHotelListDataAtom,
    getPoolListDataAtom,
    getRestaurantListDataAtom,
    getTourismListDataAtom,
    hotelDownloadStateAtom,
    poolDownloadStateAtom,
    refreshListDataAtom,
    restaurantDownloadStateAtom,
    toggleFavoriteAtom,
    tourismDownloadStateAtom,
} from "@/atoms/listAtom";
import { MaterialIcons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ComponentProps } from "react";
import {
    ActivityIndicator,
    Animated,
    FlatList,
    Linking,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    TextInput,
    type TextInput as TextInputInstance,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Section } from "@/components/layout/Section";
import { DestinationCard } from "@/components/shared/DestinationCard";
import { Hero } from "@/components/shared/Hero";
import { CircleButton } from "@/components/ui/CircleButton";
import { Typography } from "@/components/ui/Typography";
import { CATEGORY_DETAILS, LIST_TYPES } from "@/constants/categories";
import { COLORS, RADIUS, SPACING } from "@/constants/theme";
import type { ItemWithDistance } from "@/services/models/Item";
import type { ListType } from "@/services/storage";
import { router } from "expo-router";

type IconName = ComponentProps<typeof MaterialIcons>["name"];
type TravelProfileKey = "walker" | "explorer" | "traveler";

const HERO_IMAGE =
    "https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=1200&q=85";

const categories: { key: ListType; title: string; icon: IconName }[] =
    LIST_TYPES.map((key) => ({
        key,
        title: CATEGORY_DETAILS[key].title,
        icon: CATEGORY_DETAILS[key].icon as IconName,
    }));

export default function ExploreScreen() {
    const beaches = useAtomValue(getBeachListDataAtom);
    const pools = useAtomValue(getPoolListDataAtom);
    const hotels = useAtomValue(getHotelListDataAtom);
    const restaurants = useAtomValue(getRestaurantListDataAtom);
    const tourism = useAtomValue(getTourismListDataAtom);

    const beachState = useAtomValue(beachDownloadStateAtom);
    const poolState = useAtomValue(poolDownloadStateAtom);
    const hotelState = useAtomValue(hotelDownloadStateAtom);
    const restaurantState = useAtomValue(restaurantDownloadStateAtom);
    const tourismState = useAtomValue(tourismDownloadStateAtom);

    const refresh = useSetAtom(refreshListDataAtom);
    const favorites = useAtomValue(favoritesAtom);
    const toggleFavorite = useSetAtom(toggleFavoriteAtom);
    const [query, setQuery] = useAtom(filterValueAtom);
    const [activeCategory, setActiveCategory] = useState<ListType>("beach");
    const [showAllResults, setShowAllResults] = useState(false);
    const [selectedProfile, setSelectedProfile] =
        useState<TravelProfileKey | null>("walker");
    const [savedPlaceName, setSavedPlaceName] = useState<string | null>(null);
    const searchInputRef = useRef<TextInputInstance>(null);
    const scrollY = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        for (const list of [
            "beach",
            "pool",
            "hotel",
            "restaurant",
            "tourism",
        ]) {
            refresh(list as ListType);
        }
    }, [refresh]);

    const activeItems = useMemo(() => {
        const itemsByType: Record<ListType, ItemWithDistance[]> = {
            beach: beaches,
            pool: pools,
            hotel: hotels,
            restaurant: restaurants,
            tourism,
        };
        return itemsByType[activeCategory];
    }, [activeCategory, beaches, hotels, pools, restaurants, tourism]);

    const activeDownloadState = {
        beach: beachState,
        pool: poolState,
        hotel: hotelState,
        restaurant: restaurantState,
        tourism: tourismState,
    }[activeCategory];
    const isRefreshing =
        beachState.isRefreshing ||
        poolState.isRefreshing ||
        hotelState.isRefreshing ||
        restaurantState.isRefreshing ||
        tourismState.isRefreshing;
    const isLoading = activeDownloadState.isLoading;

    const isSearching = query.trim().length > 0;

    const profileOptions = [
        {
            key: "walker" as TravelProfileKey,
            label: "A tu alcance: <2km",
            icon: "directions-walk" as IconName,
        },
        {
            key: "explorer" as TravelProfileKey,
            label: "Tu radio local: 2-10km",
            icon: "explore" as IconName,
        },
        {
            key: "traveler" as TravelProfileKey,
            label: "Tu gran escape: 10+km",
            icon: "travel-explore" as IconName,
        },
    ];

    const itemsByTravelProfile = useMemo(() => {
        if (!selectedProfile || isSearching) {
            return activeItems;
        }

        return activeItems.filter((item) => {
            if (typeof item.distance !== "number") {
                return false;
            }

            switch (selectedProfile) {
                case "walker":
                    return item.distance < 2000;
                case "explorer":
                    return item.distance >= 2000 && item.distance <= 10000;
                case "traveler":
                    return item.distance > 10000;
                default:
                    return true;
            }
        });
    }, [activeItems, isSearching, selectedProfile]);

    const featuredItems = useMemo(
        () => itemsByTravelProfile.slice(0, 3),
        [itemsByTravelProfile],
    );

    const handleToggleFavorite = (id: string, name: string) => {
        toggleFavorite(id);
        setSavedPlaceName(name);
    };

    useEffect(() => {
        if (!savedPlaceName) return;
        const timer = setTimeout(() => setSavedPlaceName(null), 2200);
        return () => clearTimeout(timer);
    }, [savedPlaceName]);

    const activeCategoryMeta = categories.find((c) => c.key === activeCategory);
    const activeCategoryTitle = activeCategoryMeta?.title ?? "Resultados";

    const handleSearchChange = (value: string) => {
        setQuery(value);
        if (value.trim().length > 0 && selectedProfile) {
            setSelectedProfile(null);
        }
        if (showAllResults) {
            setShowAllResults(false);
        }
    };

    const handleCategoryChange = (category: ListType) => {
        setQuery("");
        setActiveCategory(category);
        if (showAllResults) {
            setShowAllResults(false);
        }
    };

    const handleSelectProfile = (profileKey: TravelProfileKey) => {
        setShowAllResults(false);
        setSelectedProfile((current) =>
            current === profileKey ? null : profileKey,
        );
    };

    const hasResults = itemsByTravelProfile.length > 0;
    const shouldShowToggle = !isSearching && itemsByTravelProfile.length > 3;
    const visibleItems =
        isSearching || showAllResults ? itemsByTravelProfile : featuredItems;
    const sectionTitle = isSearching
        ? `Tu selección para "${query.trim()}"`
        : activeCategoryTitle;

    return (
        <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
            <StatusBar style="light" />
            <Animated.ScrollView
                style={styles.screen}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={() => refresh(activeCategory)}
                        tintColor={COLORS.primary}
                    />
                }
                showsVerticalScrollIndicator={false}
                scrollEventThrottle={16}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: true },
                )}
            >
                <Hero
                    image={HERO_IMAGE}
                    eyebrow="CONCEBIDO ESPECIALMENTE PARA TI"
                    title={"Personalicemos tu\npróximo respiro..."}
                    subtitle="Selección curada en tiempo real de espacios seguros, limpios y saludables creados para conectar con lo que necesitas."
                    scrollY={scrollY}
                    rightElement={
                        <CircleButton
                            icon="shopping-basket"
                            label="Ver mi plan"
                            onPress={() => router.push("/cart")}
                        />
                    }
                >
                    <View style={styles.searchBox}>
                        <MaterialIcons
                            name="location-on"
                            size={20}
                            color={COLORS.muted}
                        />
                        <TextInput
                            ref={searchInputRef}
                            value={query}
                            onChangeText={handleSearchChange}
                            placeholder="¿Qué rincón buscas hoy para renovarte?"
                            placeholderTextColor="#8B7E7C"
                            style={styles.searchInput}
                        />
                    </View>

                    <View style={styles.profileWrap}>
                        <Typography
                            variant="label"
                            bold
                            color="rgba(255,255,255,0.85)"
                            style={styles.profileHeading}
                        >
                            Tu ritmo ideal hoy
                        </Typography>
                        <FlatList
                            data={profileOptions}
                            horizontal
                            keyExtractor={(item) => item.key}
                            contentContainerStyle={styles.profileList}
                            showsHorizontalScrollIndicator={false}
                            renderItem={({ item }) => {
                                const active = selectedProfile === item.key;
                                return (
                                    <Pressable
                                        onPress={() =>
                                            handleSelectProfile(item.key)
                                        }
                                        style={[
                                            styles.profileChip,
                                            active && styles.profileChipActive,
                                        ]}
                                        accessibilityRole="button"
                                        accessibilityState={{
                                            selected: active,
                                        }}
                                        accessibilityLabel={`Perfil ${item.label}`}
                                    >
                                        <MaterialIcons
                                            name={item.icon}
                                            size={18}
                                            color={
                                                active
                                                    ? COLORS.primary
                                                    : COLORS.white
                                            }
                                        />
                                        <Typography
                                            variant="label"
                                            bold
                                            color={
                                                active
                                                    ? COLORS.primary
                                                    : COLORS.white
                                            }
                                        >
                                            {item.label}
                                        </Typography>
                                    </Pressable>
                                );
                            }}
                        />
                    </View>
                </Hero>

                <View style={styles.content}>
                    <Section title="Tus opciones de bienestar">
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.categoryScroll}
                        >
                            {categories.map((cat) => {
                                const active = activeCategory === cat.key;
                                return (
                                    <Pressable
                                        key={cat.key}
                                        onPress={() =>
                                            handleCategoryChange(cat.key)
                                        }
                                        style={[
                                            styles.categoryCard,
                                            active && styles.categoryCardActive,
                                        ]}
                                    >
                                        <View
                                            style={[
                                                styles.categoryIcon,
                                                active &&
                                                    styles.categoryIconActive,
                                            ]}
                                        >
                                            <MaterialIcons
                                                name={cat.icon}
                                                size={20}
                                                color={
                                                    active
                                                        ? COLORS.white
                                                        : COLORS.primary
                                                }
                                            />
                                        </View>
                                        <Typography
                                            variant="label"
                                            bold
                                            color={
                                                active
                                                    ? COLORS.white
                                                    : COLORS.muted
                                            }
                                        >
                                            {cat.title}
                                        </Typography>
                                    </Pressable>
                                );
                            })}
                        </ScrollView>
                    </Section>

                    {hasResults && (
                        <Section
                            title={sectionTitle}
                            rightLabel={
                                shouldShowToggle
                                    ? showAllResults
                                        ? "Ver menos"
                                        : "Ver todas tus opciones"
                                    : undefined
                            }
                            onRightPress={
                                shouldShowToggle
                                    ? () =>
                                          setShowAllResults(
                                              (current) => !current,
                                          )
                                    : undefined
                            }
                        >
                            <View style={styles.grid}>
                                {visibleItems.map((item, index) => (
                                    <DestinationCard
                                        key={`top-${item.id}-${index}`}
                                        item={item}
                                        category={activeCategory}
                                        isFavorite={favorites.includes(item.id)}
                                        onToggleFavorite={() =>
                                            handleToggleFavorite(
                                                item.id,
                                                item.strNombre,
                                            )
                                        }
                                        onPress={() => {
                                            router.push(`/${item.id}`);
                                            // const url = item.mapUrl ?? `https://www.google.com/maps/dir/?api=1&destination=${item.strLatitud},${item.strLongitud}`;
                                        }}
                                    />
                                ))}
                            </View>
                        </Section>
                    )}

                    <View style={styles.newsletterSection}>
                        <View style={styles.newsletterGlow} />
                        <Typography variant="h2" color={COLORS.white}>
                            ¿Diseñamos tu próxima pausa?
                        </Typography>
                        <Typography
                            variant="body"
                            color="rgba(255,255,255,0.9)"
                            style={styles.newsletterText}
                        >
                            Suscríbete para recibir reportes de salud de tus
                            rincones favoritos y recomendaciones semanales
                            hechas a tu medida.
                        </Typography>
                        <Pressable style={styles.newsletterButton}>
                            <Typography
                                variant="label"
                                bold
                                color={COLORS.primary}
                            >
                                Quiero mi guía personalizada
                            </Typography>
                        </Pressable>
                    </View>
                </View>
            </Animated.ScrollView>

            {savedPlaceName && (
                <View style={styles.toast}>
                    <MaterialIcons
                        name="favorite"
                        size={16}
                        color={COLORS.primary}
                    />
                    <Typography
                        variant="label"
                        bold
                        color={COLORS.white}
                        style={styles.toastText}
                    >
                        Guardado en tu selección: {savedPlaceName}
                    </Typography>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: COLORS.background },
    screen: { flex: 1 },
    scrollContent: { paddingBottom: 120, flexGrow: 1 },
    iconButton: { padding: 8 },
    heroIconButton: {
        padding: 8,
        borderRadius: 99,
        backgroundColor: "rgba(255,255,255,0.15)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.2)",
        alignItems: "center",
        justifyContent: "center",
    },
    searchBox: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(255,255,255,0.96)",
        borderRadius: RADIUS.xl,
        paddingLeft: 16,
        paddingRight: 6,
        height: 58,
        shadowColor: "#000",
        shadowOpacity: 0.18,
        shadowRadius: 16,
        elevation: 8,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.85)",
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 15,
        color: COLORS.ink,
        fontWeight: "500",
    },
    searchCta: {
        backgroundColor: COLORS.primary,
        borderRadius: RADIUS.lg,
        paddingHorizontal: SPACING.lg,
        height: 46,
        alignItems: "center",
        justifyContent: "center",
    },
    profileWrap: {
        marginTop: 22,
    },
    profileHeading: {
        textTransform: "uppercase",
        letterSpacing: 1.5,
        fontSize: 10,
        color: "rgba(255,255,255,0.75)",
        marginBottom: 10,
        fontWeight: "900",
    },
    profileList: {
        gap: 10,
    },
    profileChip: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 16,
        height: 40,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.22)",
        backgroundColor: "rgba(255,255,255,0.08)",
    },
    profileChipActive: {
        backgroundColor: COLORS.white,
        borderColor: COLORS.white,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 4,
    },
    content: {
        marginTop: -24,
        backgroundColor: COLORS.background,
        borderTopLeftRadius: RADIUS.xxl,
        borderTopRightRadius: RADIUS.xxl,
        paddingTop: 24,
    },
    categoryScroll: {
        paddingHorizontal: SPACING.xl,
        gap: 10,
        paddingBottom: 10,
        flexDirection: "row",
        flexWrap: "wrap",
    },
    categoryCard: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingHorizontal: SPACING.sm,
        paddingVertical: SPACING.sm,
        borderRadius: RADIUS.xl,
        borderWidth: 1,
        borderColor: COLORS.line,
        backgroundColor: COLORS.white,
    },
    categoryCardActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    categoryIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: COLORS.palePrimary,
        alignItems: "center",
        justifyContent: "center",
    },
    categoryIconActive: { backgroundColor: COLORS.primary },
    grid: {
        paddingHorizontal: SPACING.xl,
        gap: 10,
        flexDirection: "column",
        alignItems: "stretch",
    },
    newsletterSection: {
        marginTop: 30,
        marginHorizontal: SPACING.xl,
        borderRadius: 24,
        backgroundColor: COLORS.primary,
        padding: 20,
        overflow: "hidden",
    },
    newsletterGlow: {
        position: "absolute",
        top: -30,
        right: -24,
        width: 130,
        height: 130,
        borderRadius: 65,
        backgroundColor: "rgba(255,255,255,0.18)",
    },
    newsletterText: {
        marginTop: 8,
        marginBottom: 16,
    },
    newsletterButton: {
        alignSelf: "flex-start",
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.lg,
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    toast: {
        position: "absolute",
        bottom: 40,
        left: 20,
        right: 20,
        backgroundColor: "rgba(25,28,29,0.95)",
        borderRadius: RADIUS.lg,
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    toastText: { flex: 1 },
});
