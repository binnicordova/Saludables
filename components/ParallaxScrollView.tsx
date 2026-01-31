import type { PropsWithChildren, ReactElement } from "react";
import { useRef } from "react";
import { Animated, StyleSheet } from "react-native";

import { ThemedView } from "@/components/ThemedView";
import { useBottomTabOverflow } from "@/components/ui/TabBarBackground";
import { useColorScheme } from "@/hooks/useColorScheme";

const HEADER_HEIGHT = 250;

type Props = PropsWithChildren<{
    headerImage: ReactElement;
    headerBackgroundColor: { dark: string; light: string };
}>;

export default function ParallaxScrollView({
    children,
    headerImage,
    headerBackgroundColor,
}: Props) {
    const colorScheme = (useColorScheme() ?? "light") as "light" | "dark";
    const scrollOffset = useRef(new Animated.Value(0)).current;
    const bottom = useBottomTabOverflow();

    const headerAnimatedStyle = {
        transform: [
            {
                translateY: scrollOffset.interpolate({
                    inputRange: [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
                    outputRange: [-HEADER_HEIGHT / 2, 0, HEADER_HEIGHT * 0.75],
                }),
            },
            {
                scale: scrollOffset.interpolate({
                    inputRange: [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
                    outputRange: [2, 1, 1],
                }),
            },
        ],
    };

    return (
        <ThemedView style={styles.container}>
            <Animated.ScrollView
                scrollEventThrottle={16}
                scrollIndicatorInsets={{ bottom }}
                contentContainerStyle={{ paddingBottom: bottom }}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollOffset } } }],
                    { useNativeDriver: true },
                )}
            >
                <Animated.View
                    style={[
                        styles.header,
                        { backgroundColor: headerBackgroundColor[colorScheme] },
                        headerAnimatedStyle,
                    ]}
                >
                    {headerImage}
                </Animated.View>
                <ThemedView style={styles.content}>{children}</ThemedView>
            </Animated.ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        height: HEADER_HEIGHT,
        overflow: "hidden",
    },
    content: {
        flex: 1,
        padding: 32,
        gap: 16,
        overflow: "hidden",
    },
});
