import React from "react";
import { Pressable, View, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { ThemedText } from "./ThemedText";

type VisitButtonProps = {
    isHealthy: boolean;
    color: string;
    onPress: () => void;
    style?: any;
};

export const VisitButton: React.FC<VisitButtonProps> = ({ isHealthy, color, onPress, style }) => (
    <Pressable
        accessible
        accessibilityRole="button"
        accessibilityLabel={isHealthy ? "Ver ruta" : "No visitar - ver ruta"}
        accessibilityHint="Abre la ruta en Google Maps"
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        style={[styles.visitButton, isHealthy ? { backgroundColor: color } : styles.visitButtonMuted, !isHealthy ? { borderColor: color } : null, style]}
        onPress={onPress}
    >
        <View style={styles.visitButtonInner}>
            <MaterialIcons name="place" size={14} color={isHealthy ? "#fff" : color} style={{ marginRight: 6 }} />
            <ThemedText style={isHealthy ? styles.visitButtonText : [styles.visitButtonTextMuted, { color }]}> 
                {isHealthy ? "VER RUTA" : "NO VISITAR"}
            </ThemedText>
        </View>
    </Pressable>
);

const styles = StyleSheet.create({
    visitButton: {
        paddingHorizontal: 6,
        paddingVertical: 4,
        borderRadius: 8,
        minWidth: 56,
        alignItems: "center",
        justifyContent: "center",
    },
    visitButtonInner: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    visitButtonText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "600",
    },
    visitButtonMuted: {
        backgroundColor: "transparent",
        borderWidth: 1,
        paddingHorizontal: 6,
        paddingVertical: 4,
    },
    visitButtonTextMuted: {
        fontSize: 12,
        fontWeight: "600",
    },
});

export default VisitButton;
