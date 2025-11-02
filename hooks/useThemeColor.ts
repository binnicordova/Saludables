import { COLORS } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

export type ThemeColorName = keyof typeof COLORS.light &
    keyof typeof COLORS.dark;

export function useThemeColor(
    props: { light?: string; dark?: string },
    colorName: ThemeColorName,
) {
    const theme = useColorScheme() ?? "light";
    const colorFromProps = props[theme];

    if (colorFromProps) {
        return colorFromProps;
    }

    const colorMap = COLORS[theme] as Record<string, string | undefined>;
    const result = colorMap[colorName];
    if (!result) {
        console.warn(
            `[useThemeColor] Unknown color key "${String(
                colorName,
            )}" for theme "${theme}". Falling back to ${colorMap.text}`,
        );
        return colorMap.text;
    }
    return result;
}
