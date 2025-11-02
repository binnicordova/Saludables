import { filterValueAtom, shouldFilterHealthAtom } from "@/atoms/listAtom";
import { shouldHideElementsAtom } from "@/store/atoms";
import { useAtom, useAtomValue } from "jotai";
import {
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedIcon } from "./ThemedIcon";
import { ThemedView } from "./ThemedView";

export const FloatingCard = () => {
    const [filter, setFilter] = useAtom(filterValueAtom);
    const [shouldFilterHealth, setShouldFilterHealth] = useAtom(
        shouldFilterHealthAtom,
    );
    const tabBarVisible = useAtomValue(shouldHideElementsAtom);
    const insets = useSafeAreaInsets();

    const clear = () => setFilter("");

    const behavior = Platform.OS === "ios" ? "padding" : "position";

    const TAB_BAR_HEIGHT = 56;

    return (
        <KeyboardAvoidingView
            pointerEvents="box-none"
            behavior={behavior}
            keyboardVerticalOffset={
                insets.bottom + (tabBarVisible ? TAB_BAR_HEIGHT : 0)
            }
            style={[
                styles.wrapper,
                {
                    bottom:
                        insets.bottom + (tabBarVisible ? TAB_BAR_HEIGHT : 0),
                },
            ]}
        >
            <ThemedView style={styles.card} accessibilityRole="search">
                <View style={styles.row}>
                    <TextInput
                        value={filter}
                        onChangeText={setFilter}
                        autoFocus={false}
                        placeholder="Filtrar..."
                        placeholderTextColor="#999"
                        style={styles.input}
                        returnKeyType="search"
                        accessible
                        accessibilityLabel="Filtro de búsqueda"
                    />
                    <View
                        style={styles.toggleContainer}
                        accessible
                        accessibilityRole="switch"
                        accessibilityLabel="Filtrar por salud"
                    >
                        <Text style={styles.toggleLabel}>Saludables</Text>
                        <Switch
                            value={shouldFilterHealth}
                            onValueChange={setShouldFilterHealth}
                            thumbColor={
                                Platform.OS === "android"
                                    ? shouldFilterHealth
                                        ? "#2196f3"
                                        : "#f4f3f4"
                                    : undefined
                            }
                            trackColor={{ false: "#ccc", true: "#81b0ff" }}
                            accessibilityLabel="Alternar filtro de calidad sanitaria"
                        />
                    </View>
                    {filter.length > 0 ? (
                        <TouchableOpacity
                            onPress={clear}
                            accessibilityRole="button"
                            accessibilityLabel="Limpiar filtro"
                            style={styles.clearBtn}
                        >
                            <ThemedIcon name="close" size={18} color="#333" />
                        </TouchableOpacity>
                    ) : null}
                </View>
            </ThemedView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        position: "absolute",
        left: 16,
        right: 16,
        bottom: 24,
        zIndex: 999,
    },
    card: {
        width: "100%",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        // glass style
        backgroundColor: "rgba(255,255,255,0.6)", // translucent surface
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.45)",
        overflow: "hidden", // ensure rounded corners clip children
        // softer shadow for glass feel
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 4, // keep a bit of elevation on Android
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
    },
    input: {
        flex: 1,
        paddingVertical: 6,
        paddingHorizontal: 8,
        fontSize: 14,
        color: "#222",
    },
    toggleContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginLeft: 8,
        paddingHorizontal: 6,
    },
    toggleLabel: {
        fontSize: 13,
        color: "#333",
        marginRight: 6,
    },
    clearBtn: {
        marginLeft: 8,
        paddingHorizontal: 8,
        paddingVertical: 6,
        borderRadius: 8,
        backgroundColor: "rgba(0,0,0,0.06)",
    },
});
