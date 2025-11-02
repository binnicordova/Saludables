import { FloatingCard } from "@/components/FloatingCard";
import { HapticTab } from "@/components/HapticTab";
import { ThemedIcon } from "@/components/ThemedIcon";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { useThemeColor } from "@/hooks/useThemeColor";
import { shouldHideElementsAtom } from "@/store/atoms";
import { Tabs } from "expo-router";
import { useAtom } from "jotai";
import React from "react";
import { Platform } from "react-native";

export default function TabLayout() {
    const tint = useThemeColor({}, "tint");
    const [shouldHideElements] = useAtom(shouldHideElementsAtom);

    return (
        <>
            <Tabs
                initialRouteName="index"
                screenOptions={() => ({
                    tabBarActiveTintColor: tint,
                    headerShown: false,
                    headerBackButtonDisplayMode: "minimal",
                    headerShadowVisible: false,
                    tabBarButton: HapticTab,
                    tabBarBackground: TabBarBackground,
                    tabBarStyle: !shouldHideElements
                        ? { display: "none", height: 0 }
                        : undefined,
                    tabBarVisibilityAnimationConfig: {
                        show: {
                            animation: "timing",
                            config: { duration: 500 },
                        },
                        hide: {
                            animation: "timing",
                            config: { duration: 500 },
                        },
                    },
                })}
            >
                <Tabs.Screen
                    name="index"
                    options={{
                        title: "PLAYAS",
                        tabBarIcon: ({ color }) => (
                            <ThemedIcon size={28} name="beach" color={color} />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="pool"
                    options={{
                        title: "PISCINAS",
                        tabBarIcon: ({ color }) => (
                            <ThemedIcon size={28} name="pool" color={color} />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="profile"
                    options={{
                        title: "Perfil",
                        tabBarIcon: ({ color }) => (
                            <ThemedIcon
                                size={28}
                                name={
                                    Platform.OS === "ios"
                                        ? "account-circle-outline"
                                        : "account-circle"
                                }
                                color={color}
                            />
                        ),
                    }}
                />
            </Tabs>
            {shouldHideElements && <FloatingCard />}
        </>
    );
}
