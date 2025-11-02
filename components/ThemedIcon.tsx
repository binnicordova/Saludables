import {
    MaterialCommunityIcons as MaterialCommunityIconsType,
    createIconSet,
} from "@expo/vector-icons";
import type React from "react";

import { useThemeColor } from "@/hooks/useThemeColor";

const glyphMap = MaterialCommunityIconsType.glyphMap;

const MaterialCommunityIcons = createIconSet(
    glyphMap,
    "fontFamily",
    require("../assets/fonts/MaterialCommunityIcons.ttf"),
);

type ThemedIconProps = {
    name: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
    size?: number;
    color?: string;
    onPress?: React.ComponentProps<typeof MaterialCommunityIcons>["onPress"];
    lightColor?: string;
    darkColor?: string;
    style?: React.ComponentProps<typeof MaterialCommunityIcons>["style"];
};

export const ThemedIcon: React.FC<ThemedIconProps> = ({
    name,
    size = 24,
    onPress,
    lightColor,
    darkColor,
    color,
    style,
}) => {
    const colorTheme = useThemeColor(
        { light: lightColor, dark: darkColor },
        "text",
    );

    return (
        <MaterialCommunityIcons
            name={name}
            size={size}
            color={color ?? colorTheme}
            onPress={onPress}
            style={style}
        />
    );
};
