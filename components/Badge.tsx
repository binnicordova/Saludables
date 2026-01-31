import type React from "react";
import { StyleSheet, type TextStyle } from "react-native";
import { ThemedText } from "./ThemedText";

type BadgeProps = {
    text: string;
    style?: TextStyle | TextStyle[];
};

export const Badge: React.FC<BadgeProps> = ({ text, style }) => (
    <ThemedText style={[styles.badge, style]} type="caption">
        {text}
    </ThemedText>
);

const styles = StyleSheet.create({
    badge: {
        paddingHorizontal: 6,
        paddingVertical: 4,
        borderRadius: 10,
    },
});

export default Badge;
