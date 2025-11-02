import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useThemeColor } from "@/hooks/useThemeColor";
import { type PropsWithChildren, useState } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { ThemedIcon } from "./ThemedIcon";

export function Collapsible({
    children,
    title,
    initialIsOpen = false,
}: PropsWithChildren & { title: string; initialIsOpen?: boolean }) {
    const [isOpen, setIsOpen] = useState(initialIsOpen);

    const iconColor = useThemeColor({}, "icon");

    return (
        <ThemedView>
            <TouchableOpacity
                style={styles.heading}
                onPress={() => setIsOpen((value) => !value)}
                activeOpacity={0.8}
            >
                <ThemedIcon
                    name="chevron-right"
                    size={18}
                    color={iconColor}
                    style={{
                        transform: [{ rotate: isOpen ? "90deg" : "0deg" }],
                    }}
                />

                <ThemedText type="defaultSemiBold">{title}</ThemedText>
            </TouchableOpacity>
            {isOpen && (
                <ThemedView style={styles.content}>{children}</ThemedView>
            )}
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    heading: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    content: {
        marginTop: 6,
        marginLeft: 24,
    },
});
