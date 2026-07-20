import type { ComponentProps } from "react";
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { COLORS } from "@/constants/theme";

export interface CircleButtonProps {
    icon: ComponentProps<typeof MaterialIcons>["name"];
    label: string;
    onPress: () => void;
    size?: number;
    color?: string;
    style?: StyleProp<ViewStyle>;
}

export function CircleButton({
    icon,
    label,
    onPress,
    size = 23,
    color = COLORS.white,
    style,
}: CircleButtonProps) {
    return (
        <Pressable
            style={({ pressed }) => [
                styles.circleButton,
                pressed && styles.pressed,
                style,
            ]}
            onPress={onPress}
            accessibilityLabel={label}
            accessibilityRole="button"
        >
            <MaterialIcons name={icon} size={size} color={color} />
        </Pressable>
    );
}

const styles = StyleSheet.create({
    circleButton: {
        width: 42,
        height: 42,
        borderRadius: 21,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(25,28,29,0.42)",
    },
    pressed: {
        opacity: 0.7,
    },
});
