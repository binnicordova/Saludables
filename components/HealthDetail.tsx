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
import { Pressable, StyleSheet, View } from "react-native";
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
    ACCENT_WIDTH: 6,
    IMAGE_ASPECT: 16 / 7,
    ICON_LARGE: 40,
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

const evolutiveDistanceText = (distance?: number) => {
    if (!distance) return "No disponible";
    return distance < 1000
        ? `${Math.round(distance)} m`
        : `${(distance / 1000).toFixed(2)} km`;
};

const getHealthColor = (key?: string) => {
    const isNonHealthy = (key || "").toLowerCase() === "ns";
    return isNonHealthy
        ? { color: "#C62828", light: "#FDECEA" }
        : { color: "#2E7D32", light: "#E8F5E9" };
};

const timeAgo = (dateStr?: string) => {
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

const InfoRow = ({
    icon,
    text,
    color = "#666",
    textStyle,
}: {
    icon: React.ComponentProps<typeof MaterialIcons>["name"];
    text: string;
    color?: string;
    textStyle?: any;
}) => (
    <View style={styles.infoRow}>
        <MaterialIcons name={icon} size={14} color={color} />
        <ThemedText numberOfLines={1} style={[styles.smallText, textStyle]}>
            {text}
        </ThemedText>
    </View>
);

/* Reusable helpers & small components to avoid repetition and improve SRP/DRY */
const MAP_URL = (lat?: string, lng?: string) =>
    lat && lng
        ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
        : "";

const openMaps = (lat?: string, lng?: string) => {
    const url = MAP_URL(lat, lng);
    if (!url) return;
    Linking.openURL(url);
};

const Badge = ({
    text,
    bg,
    fg,
}: { text: string; bg?: string; fg?: string }) => (
    <ThemedText
        style={[
            styles.badge,
            bg ? { backgroundColor: bg } : null,
            fg ? { color: fg } : null,
        ]}
    >
        {text}
    </ThemedText>
);

const VisitButton = ({
    isHealthy,
    color,
    onPress,
}: {
    isHealthy: boolean;
    color: string;
    onPress: () => void;
}) => (
    <Pressable
        style={[
            styles.visitButton,
            isHealthy ? { backgroundColor: color } : styles.visitButtonMuted,
            !isHealthy ? { borderColor: color } : null,
        ]}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${isHealthy ? "Visitar" : "No visitar"}`}
    >
        <ThemedText
            style={
                isHealthy ? styles.visitButtonText : styles.visitButtonTextMuted
            }
        >
            {isHealthy ? "VISITAR" : "NO VISITAR"}
        </ThemedText>
    </Pressable>
);

const ChipItem = ({
    id,
    control,
}: { id: string; control: { control: string; valor: number } }) => {
    const passed = control.valor === 1;
    return (
        <View key={`${id}_${control.control}`} style={styles.chip}>
            <View
                style={[
                    styles.chipDot,
                    passed ? styles.dotGood : styles.dotBad,
                ]}
            />
            <ThemedText style={styles.chipText} numberOfLines={1}>
                {control.control}
            </ThemedText>
            <MaterialIcons
                name={passed ? "check" : "close"}
                size={12}
                color="#666"
            />
        </View>
    );
};

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

    const borderColor = isFavorited ? favoriteColor : health.color;

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
            {/* make the whole card tappable (also keeps existing icon actions) */}
            <Pressable
                style={[styles.container, { backgroundColor: bgColor }]}
                onPress={handleOpenMaps}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                accessibilityRole="button"
                accessibilityLabel={`Abrir ruta hacia ${strNombre}`}
            >
                <View
                    style={[
                        styles.leftAccent,
                        { backgroundColor: borderColor },
                    ]}
                />

                <View style={styles.imageContainer}>
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
                                        bg={health.light}
                                        fg={health.color}
                                    />
                                    <Badge
                                        text={strCalidadSanitaria}
                                        bg={health.light}
                                        fg={health.color}
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
                                    size={40}
                                    color={borderColor}
                                />
                            </View>
                        </View>

                        <View style={styles.metaRow}>
                            <InfoRow
                                icon="event"
                                text={lastInspectionText}
                                color={overlayTextColor}
                                textStyle={[
                                    styles.overlaySmallText,
                                    { color: overlayTextColor },
                                ]}
                            />
                            <InfoRow
                                icon="location-city"
                                text={`${strDepartamento || "-"}, ${strProvincia || "-"}, ${strDistrito || "-"}`}
                                color={overlayTextColor}
                                textStyle={[
                                    styles.overlaySmallText,
                                    { color: overlayTextColor },
                                ]}
                            />
                        </View>
                    </ThemedView>
                </View>

                <ThemedView style={styles.content}>
                    {aControles.length > 0 ? (
                        <ThemedView>
                            <View style={styles.chipsRow}>
                                {aControles.slice(0, 3).map((control) => (
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
                                            size={12}
                                            color={muted}
                                        />
                                    </View>
                                ))}
                                {aControles.length > 3 ? (
                                    <ThemedText
                                        style={[
                                            styles.moreText,
                                            { color: mutedText },
                                        ]}
                                    >
                                        +{aControles.length - 3} más
                                    </ThemedText>
                                ) : null}
                            </View>
                        </ThemedView>
                    ) : null}
                </ThemedView>
            </Pressable>
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
    leftAccent: {
        position: "absolute",
        left: 0,
        top: 0,
        bottom: 0,
        width: SIZE.ACCENT_WIDTH,
        borderTopLeftRadius: SIZE.RADIUS,
        borderBottomLeftRadius: SIZE.RADIUS,
        zIndex: 1,
    },
    content: {
        padding: SPACING.PAD,
    },
    imageContainer: {
        width: "100%",
        aspectRatio: SIZE.IMAGE_ASPECT,
        borderRadius: SIZE.RADIUS,
        overflow: "hidden",
        position: "relative",
        marginBottom: SPACING.M,
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
    },
    overlaySmallText: {
        fontSize: FONT.SMALL,
        color: "#fff",
        marginLeft: SPACING.M,
        lineHeight: 13,
    },

    /* typography */
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

    /* layout */
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
        width: 10,
        height: 10,
        borderRadius: 6,
        marginLeft: SPACING.M,
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.06)",
    },

    badges: {
        flexDirection: "row",
        marginTop: SPACING.S,
        gap: SPACING.M,
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
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        minWidth: SIZE.BUTTON_MIN_W,
        alignItems: "center",
        justifyContent: "center",
    },
    visitButtonText: {
        color: "#fff",
        fontSize: FONT.BUTTON,
        fontWeight: "600",
    },
    visitButtonMuted: {
        backgroundColor: "#fff",
        borderWidth: 1,
    },
    visitButtonTextMuted: {
        color: "#333",
        fontSize: FONT.BUTTON,
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

    /* chips */
    chipsRow: {
        flexDirection: "row",
        alignItems: "center",
        flexWrap: "wrap",
    },
    chip: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 8,
        borderRadius: 12,
        marginRight: 8,
        backgroundColor: COLORS.light.background,
        borderWidth: 1,
        borderColor: COLORS.light.chipBorder,
        maxHeight: SIZE.CHIP_MIN_H,
        opacity: 0.5,
        alignContent: "center",
        textAlign: "center",
    },
    chipDot: {
        width: SIZE.DOT,
        height: SIZE.DOT,
        borderRadius: SIZE.DOT / 2,
        marginRight: SPACING.M,
    },
    dotGood: {
        backgroundColor: "#A5D6A7",
    },
    dotBad: {
        backgroundColor: "#FFCDD2",
    },
    chipText: {
        fontSize: FONT.SMALL,
        color: COLORS.light.muted,
        marginRight: 6,
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
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0,0,0,0.35)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.6)",
    },
});

export default HealthDetail;
