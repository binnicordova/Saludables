import { StyleSheet, View, Pressable } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Typography } from "@/components/ui/Typography";
import { COLORS, SPACING } from "@/constants/theme";
import { router } from "expo-router";

interface HeaderProps {
    showBack?: boolean;
    rightElement?: React.ReactNode;
}

export const Header = ({ showBack, rightElement }: HeaderProps) => {
    return (
        <View style={styles.header}>
            <View style={styles.left}>
                {showBack ? (
                    <Pressable onPress={() => router.back()} style={styles.backButton}>
                        <MaterialIcons name="arrow-back" size={23} color={COLORS.ink} />
                    </Pressable>
                ) : null}
                <View style={styles.brandRow}>
                    <MaterialIcons name="spa" size={25} color={COLORS.primary} />
                    <Typography variant="h3" color={COLORS.primary}>Saludables</Typography>
                </View>
            </View>
            <View style={styles.right}>
                {rightElement}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        height: 58,
        backgroundColor: COLORS.white,
        paddingHorizontal: SPACING.xl,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottomWidth: 1,
        borderBottomColor: "#F0F0F0",
    },
    left: {
        flexDirection: "row",
        alignItems: "center",
        gap: SPACING.sm,
    },
    backButton: {
        padding: SPACING.xs,
        marginRight: SPACING.xs,
    },
    brandRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    right: {
        flexDirection: "row",
        alignItems: "center",
    },
});
