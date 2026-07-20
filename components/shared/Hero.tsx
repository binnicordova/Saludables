import { Typography } from "@/components/ui/Typography";
import { COLORS, RADIUS, SPACING } from "@/constants/theme";
import { MaterialIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Animated, StyleSheet, View, type ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface HeroProps {
    image: string;
    eyebrow: string;
    title: string;
    subtitle: string;
    children?: React.ReactNode;
    style?: ViewStyle;
    rightElement?: React.ReactNode;
    scrollY?: Animated.Value;
}

export const Hero = ({
    image,
    eyebrow,
    title,
    subtitle,
    children,
    style,
    rightElement,
    scrollY,
}: HeroProps) => {
    const translateY = scrollY
        ? scrollY.interpolate({
              inputRange: [0, 620],
              outputRange: [0, 248], // travels offset by 40% (slower scroll)
              extrapolate: "clamp",
          })
        : 0;

    const scale = scrollY
        ? scrollY.interpolate({
              inputRange: [-200, 0],
              outputRange: [1.2, 1], // stretch/zoom effect on scroll-down pull
              extrapolateRight: "clamp",
          })
        : 1;

    return (
        <View style={[styles.hero, style]}>
            <Animated.View
                style={[
                    StyleSheet.absoluteFill,
                    {
                        transform: [{ translateY }, { scale }],
                    },
                ]}
            >
                <Image
                    source={{ uri: image }}
                    style={StyleSheet.absoluteFill}
                    contentFit="cover"
                />
                <LinearGradient
                    colors={[
                        "rgba(10,15,13,0.60)",
                        "rgba(10,15,13,0.20)",
                        "rgba(10,15,13,0.92)",
                    ]}
                    locations={[0.0, 0.45, 1.0]}
                    style={StyleSheet.absoluteFill}
                />
            </Animated.View>
            <SafeAreaView edges={["top"]} style={styles.headerSafeArea}>
                <View style={styles.brandRow}>
                    <View style={styles.brandLeft}>
                        <MaterialIcons
                            name="spa"
                            size={28}
                            color={COLORS.palePrimary}
                        />
                        <Typography
                            variant="h3"
                            color={COLORS.white}
                            bold
                            style={styles.brandText}
                        >
                            Saludables
                        </Typography>
                    </View>
                    {rightElement && (
                        <View style={styles.brandRight}>{rightElement}</View>
                    )}
                </View>
            </SafeAreaView>
            <View style={styles.content}>
                <Typography
                    variant="eyebrow"
                    color="#FFB4AB"
                    style={styles.eyebrow}
                >
                    {eyebrow}
                </Typography>
                <Typography
                    variant="h1"
                    color={COLORS.white}
                    style={styles.title}
                >
                    {title}
                </Typography>
                <Typography
                    variant="body"
                    color="rgba(255, 255, 255, 0.85)"
                    style={styles.subtitle}
                >
                    {subtitle}
                </Typography>
                {children}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    hero: {
        height: 620,
        overflow: "hidden",
    },
    headerSafeArea: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
    },
    brandRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: SPACING.xl,
        paddingTop: SPACING.md,
    },
    brandLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    brandRight: {},
    brandText: {
        fontSize: 24,
        fontWeight: "bold",
        letterSpacing: -0.5,
    },
    content: {
        flex: 1,
        justifyContent: "flex-end",
        padding: SPACING.xl,
        paddingBottom: SPACING.xxl,
    },
    eyebrow: {
        letterSpacing: 2.5,
        marginBottom: SPACING.xs,
        fontWeight: "900",
    },
    title: {
        fontSize: 38,
        lineHeight: 44,
        letterSpacing: -1.2,
        fontWeight: "900",
        marginBottom: SPACING.sm,
    },
    subtitle: {
        fontSize: 15,
        lineHeight: 22,
        maxWidth: 320,
        opacity: 0.9,
        marginBottom: SPACING.lg,
    },
});
