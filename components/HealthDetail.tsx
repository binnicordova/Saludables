import { favoritesAtom, toggleFavoriteAtom } from "@/atoms/listAtom";
import { COLORS } from "@/constants/Colors";
import { useThemeColor } from "@/hooks/useThemeColor";
import type { ItemWithDistance } from "@/services/models/Item";
import { MaterialIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as Linking from "expo-linking";
import { useAtomValue, useSetAtom } from "jotai";
import type React from "react";
import { useCallback, useMemo } from "react";
import { Pressable, StyleSheet, View, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
} from "react-native-reanimated";
import { ThemedIcon } from "./ThemedIcon";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";

const SIZE = {
    RADIUS: 8,
    ACCENT_WIDTH: 8,
    IMAGE_ASPECT: 4 / 3,
    ICON_LARGE: 32,
    BUTTON_MIN_W: 68,
    CHIP_MIN_H: 20,
    DOT: 8,
};

const SPACING = {
    M: 6,
    S: 4,
    XS: 2,
    PAD: 8,
};

const FONT = {
    TITLE: 14,
    SMALL: 11,
    SUBTITLE: 14,
    BUTTON: 13,
};

import {
    evolutiveDistanceText,
    getHealthColor,
    timeAgo,
    openMaps,
} from "./healthUtils";
import InfoRow from "./InfoRow";
import Badge from "./Badge";
import VisitButton from "./VisitButton";

const HealthDetail: React.FC<ItemWithDistance> = ({
    id,
    strNombre,
    strCalidadSanitaria,
    keyCalidadSanitaria,
    dateUltimaInspeccion,
    strDepartamento,
    strProvincia,
    strDistrito,
    urlFoto,
    strLatitud,
    strLongitud,
    aControles,
    distance,
}) => {
    const bgColor = useThemeColor({}, "background");
    const muted = useThemeColor({}, "muted");
    const mutedText = useThemeColor({}, "mutedText");
    const chipBorder = useThemeColor({}, "chipBorder");
    const badgeBgColor = useThemeColor({}, "badgeBg");
    const titleColor = useThemeColor({}, "title");
    const favoriteColor = useThemeColor({}, "favorite");
    const overlayBgColor = useThemeColor({}, "overlayBg");
    const overlayTextColor = useThemeColor({}, "overlayText");
    const dotGoodColor = useThemeColor({}, "dotGood");
    const dotBadColor = useThemeColor({}, "dotBad");
    const statusDotBorderColor = useThemeColor({}, "statusDotBorder");

    const health = useMemo(
        () => getHealthColor(keyCalidadSanitaria),
        [keyCalidadSanitaria],
    );
    const isHealthy = useMemo(
        () => (keyCalidadSanitaria || "").toLowerCase() !== "ns",
        [keyCalidadSanitaria],
    );
    const lastInspectionText = useMemo(
        () =>
            dateUltimaInspeccion
                ? `Hace ${timeAgo(dateUltimaInspeccion)}`
                : "-",
        [dateUltimaInspeccion],
    );

    const favorites = useAtomValue(favoritesAtom);
    const toggleFavorite = useSetAtom(toggleFavoriteAtom);
    const isFavorited = Array.isArray(favorites) && favorites.includes(id);

    const borderColor = (isFavorited ? favoriteColor : health.color) ?? "#000";

    const scale = useSharedValue(1);
    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePressIn = () => {
        scale.value = withSpring(0.97, { stiffness: 220, damping: 20 });
    };
    const handlePressOut = () => {
        scale.value = withSpring(1, { stiffness: 220, damping: 20 });
    };

    const handleOpenMaps = useCallback(
        () => openMaps(strLatitud, strLongitud),
        [strLatitud, strLongitud],
    );

    return (
        <Animated.View style={[animatedStyle]}>
            <View style={[styles.container, { backgroundColor: bgColor }]}>
                <View style={styles.imageContainer}>
                    <LinearGradient
                        pointerEvents="none"
                        colors={
                            isHealthy
                                ? ["transparent", "rgba(46,125,50,0.65)"]
                                : ["transparent", "rgba(198,40,40,0.68)"]
                        }
                        start={[0.5, 0.2]}
                        end={[0.5, 1]}
                        style={styles.gradientOverlay}
                    />
                    <Pressable
                        style={[
                            styles.favoriteButton,
                            isFavorited
                                ? {
                                      borderColor: favoriteColor,
                                      backgroundColor: "rgba(255,215,0,0.12)",
                                  }
                                : null,
                        ]}
                        onPress={(e) => {
                            e?.stopPropagation?.();
                            toggleFavorite(id);
                        }}
                        accessibilityRole="button"
                        accessibilityLabel={
                            isFavorited ? "Quitar favorito" : "Marcar favorito"
                        }
                    >
                        <MaterialIcons
                            name={isFavorited ? "favorite" : "favorite-border"}
                            size={20}
                            color={isFavorited ? favoriteColor : "#fff"}
                        />
                    </Pressable>

                    <Image
                        source={
                            urlFoto
                                ? { uri: urlFoto.replace(/^http:/, "https:") }
                                : require("@/assets/images/loading.gif")
                        }
                        style={styles.imageAbsolute}
                        placeholder={require("@/assets/images/loading.gif")}
                        contentFit="cover"
                        transition={200}
                        onError={(e) => console.log(e)}
                    />

                    <ThemedView
                        style={[
                            styles.overlay,
                            { backgroundColor: overlayBgColor },
                        ]}
                    >
                        <View style={styles.topRow}>
                            <View style={styles.leftCol}>
                                <View style={styles.titleRow}>
                                    <ThemedText
                                        style={[
                                            styles.title,
                                            { color: titleColor },
                                            styles.overlayTitle,
                                        ]}
                                        numberOfLines={1}
                                    >
                                        {strNombre}
                                    </ThemedText>
                                    <View
                                        style={[
                                            styles.statusDot,
                                            {
                                                backgroundColor: borderColor,
                                                borderColor:
                                                    statusDotBorderColor,
                                            },
                                        ]}
                                    />
                                </View>
                                <View style={styles.badges}>
                                    <Badge
                                        text={evolutiveDistanceText(distance)}
                                        style={{
                                            backgroundColor: health.light,
                                            color: health.color,
                                        }}
                                    />
                                    <Badge
                                        text={strCalidadSanitaria}
                                        style={{
                                            backgroundColor: health.light,
                                            color: health.color,
                                        }}
                                    />
                                </View>
                            </View>

                            <View style={styles.actions}>
                                <VisitButton
                                    isHealthy={isHealthy}
                                    color={borderColor}
                                    onPress={handleOpenMaps}
                                />
                                <ThemedIcon
                                    name={isHealthy ? "check-circle" : "cancel"}
                                    size={SIZE.ICON_LARGE}
                                    color={borderColor}
                                />
                            </View>
                        </View>

                        <View style={styles.metaRow}>
                            <InfoRow
                                icon="event"
                                text={lastInspectionText}
                                color={"#fff"}
                                textStyle={[styles.overlaySmallText]}
                            />
                            <InfoRow
                                icon="location-city"
                                text={`${strDepartamento || "-"}, ${strProvincia || "-"}, ${strDistrito || "-"}`}
                                color={"#fff"}
                                textStyle={[styles.overlaySmallText]}
                            />
                        </View>
                    </ThemedView>
                </View>

                <ThemedView style={styles.content}>
                    {aControles.length > 0 ? (
                        <ThemedView>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.chipsRowContent}
                            >
                                {aControles.slice(0, 6).map((control) => (
                                    <View
                                        key={`${id}_${control.control}`}
                                        style={[
                                            styles.chip,
                                            { borderColor: chipBorder },
                                        ]}
                                    >
                                        <View
                                            style={[
                                                styles.chipDot,
                                                control.valor === 1
                                                    ? {
                                                          backgroundColor:
                                                              dotGoodColor,
                                                      }
                                                    : {
                                                          backgroundColor:
                                                              dotBadColor,
                                                      },
                                            ]}
                                        />
                                        <ThemedText
                                            type="caption"
                                            style={[
                                                styles.chipText,
                                                { color: muted },
                                            ]}
                                            numberOfLines={1}
                                        >
                                            {control.control}
                                        </ThemedText>
                                        <MaterialIcons
                                            name={
                                                control.valor === 1
                                                    ? "check"
                                                    : "close"
                                            }
                                            size={10}
                                            color={muted}
                                        />
                                    </View>
                                ))}

                                {aControles.length > 6 ? (
                                    <View
                                        style={[
                                            styles.chip,
                                            { borderColor: chipBorder },
                                        ]}
                                    >
                                        <ThemedText
                                            type="caption"
                                            style={[
                                                styles.chipText,
                                                { color: muted },
                                            ]}
                                        >
                                            +{aControles.length - 6} más
                                        </ThemedText>
                                    </View>
                                ) : null}
                            </ScrollView>
                        </ThemedView>
                    ) : null}
                </ThemedView>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: SIZE.RADIUS,
        margin: SPACING.M,
        overflow: "hidden",
        elevation: 1,
    },
    content: {
        padding: SPACING.XS,
    },
    imageContainer: {
        width: "100%",
        aspectRatio: SIZE.IMAGE_ASPECT,
        overflow: "hidden",
        position: "relative",
        marginBottom: SPACING.XS,
    },
    imageAbsolute: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100%",
        height: "100%",
    },
    gradientOverlay: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        top: "55%",
        zIndex: 2,
    },
    overlay: {
        position: "absolute",
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        padding: SPACING.PAD,
        justifyContent: "flex-end",
    },
    overlayTitle: {
        color: "#fff",
        textShadowColor: "rgba(0,0,0,0.6)",
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    overlaySmallText: {
        fontSize: FONT.SMALL,
        color: "#fff",
        marginLeft: SPACING.M,
        lineHeight: 13,
        textShadowColor: "rgba(0,0,0,0.5)",
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 1,
    },

    title: {
        fontSize: FONT.TITLE,
        fontWeight: "600",
        color: "#222",
    },
    subtitle: {
        fontSize: FONT.SUBTITLE,
        fontWeight: "600",
        marginTop: SPACING.M,
        marginBottom: SPACING.M,
        color: "#222",
    },
    text: {
        fontSize: FONT.SMALL,
        color: "#555",
        lineHeight: 15,
    },

    topRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: SPACING.M,
    },
    leftCol: {
        flex: 1,
        paddingRight: SPACING.M,
    },
    titleRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginLeft: SPACING.M,
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.06)",
    },

    badges: {
        flexDirection: "row",
        marginTop: SPACING.S,
        gap: SPACING.M,
        alignItems: "center",
    },
    badge: {
        backgroundColor: COLORS.light.badgeBg,
        paddingHorizontal: 6,
        paddingVertical: SPACING.XS,
        borderRadius: 10,
        fontSize: FONT.SMALL,
        color: "#444",
    },

    actions: {
        flexDirection: "row",
        gap: SPACING.M,
        alignItems: "center",
    },

    visitButton: {
        paddingHorizontal: 6,
        paddingVertical: 4,
        borderRadius: 8,
        minWidth: 56,
        alignItems: "center",
        justifyContent: "center",
    },
    visitButtonInner: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    visitButtonText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "600",
    },
    visitButtonMuted: {
        backgroundColor: "transparent",
        borderWidth: 1,
        paddingHorizontal: 6,
        paddingVertical: 4,
    },
    visitButtonTextMuted: {
        fontSize: 12,
        fontWeight: "600",
    },

    metaRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: SPACING.M,
    },
    infoRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: SPACING.M,
        flex: 1,
    },
    smallText: {
        fontSize: FONT.SMALL,
        color: "#555",
        marginLeft: SPACING.M,
        lineHeight: 13,
    },

    chipsRow: {
        flexDirection: "row",
        alignItems: "center",
        height: 28,
        overflow: "hidden",
    },
    chipsRowContent: {
        alignItems: "center",
        paddingVertical: 2,
        paddingRight: 8,
        minHeight: 28,
    },
    chip: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 12,
        marginRight: 8,
        backgroundColor: "rgba(127, 127, 127, 0.06)",
        borderWidth: 1,
        borderColor: COLORS.light.chipBorder,
        minHeight: 28,
    },
    chipDot: {
        width: 5,
        height: 5,
        borderRadius: 2.5,
        marginRight: 6,
    },
    dotGood: {
        backgroundColor: "#A5D6A7",
    },
    dotBad: {
        backgroundColor: "#FFCDD2",
    },
    chipText: {
        color: COLORS.light.muted,
        marginRight: 4,
    },
    moreText: {
        fontSize: FONT.SMALL,
        color: COLORS.light.muted,
        marginTop: SPACING.S,
    },
    favoriteButton: {
        position: "absolute",
        top: SPACING.PAD,
        right: SPACING.PAD,
        zIndex: 3,
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0,0,0,0.35)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.6)",
    },
});

export default HealthDetail;
