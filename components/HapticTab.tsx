import * as Haptics from "expo-haptics";
import type { GestureResponderEvent, StyleProp, ViewStyle } from "react-native";
import { Pressable } from "react-native";

interface HapticTabProps {
    // BottomTabBarButtonProps sometimes passes null for onPressIn
    onPressIn?: ((event: GestureResponderEvent) => void) | null | undefined;
    style?: StyleProp<ViewStyle> | null | undefined;
}

export function HapticTab({ onPressIn, style, ...otherProps }: HapticTabProps) {
    return (
        <Pressable
            {...otherProps}
            style={style}
            onPressIn={(ev) => {
                if (process.env.EXPO_OS === "ios") {
                    // Add a soft haptic feedback when pressing down on the tabs.
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                onPressIn?.(ev);
            }}
        />
    );
}
