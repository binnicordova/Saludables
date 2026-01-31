import { MaterialIcons } from "@expo/vector-icons";
import type React from "react";
import { View } from "react-native";
import { ThemedText } from "./ThemedText";

type InfoRowProps = {
    icon: React.ComponentProps<typeof MaterialIcons>["name"];
    text: string;
    color?: string;
    textStyle?: any;
    style?: any;
};

export const InfoRow: React.FC<InfoRowProps> = ({
    icon,
    text,
    color = "#666",
    textStyle,
    style,
}) => (
    <View
        style={[{ flexDirection: "row", alignItems: "center", flex: 1 }, style]}
    >
        <MaterialIcons name={icon} size={14} color={color} />
        <ThemedText numberOfLines={1} type="caption">
            {text}
        </ThemedText>
    </View>
);

export default InfoRow;
