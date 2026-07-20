import { Pressable, StyleSheet, View } from "react-native";
import { Typography } from "@/components/ui/Typography";
import { SPACING } from "@/constants/theme";

interface SectionProps {
    eyebrow?: string;
    title: string;
    rightLabel?: string;
    onRightPress?: () => void;
    children?: React.ReactNode;
}

export const Section = ({ eyebrow, title, rightLabel, onRightPress, children }: SectionProps) => {
    return (
        <View style={styles.container}>
            <View style={styles.heading}>
                <View style={styles.titleContainer}>
                    {eyebrow && <Typography variant="eyebrow">{eyebrow}</Typography>}
                    <Typography variant="h3" style={styles.title}>{title}</Typography>
                </View>
                {rightLabel && (
                    onRightPress ? (
                        <Pressable accessibilityRole="button" onPress={onRightPress} hitSlop={8}>
                            <Typography variant="label" bold style={styles.rightLabel}>
                                {rightLabel}
                            </Typography>
                        </Pressable>
                    ) : (
                        <Typography variant="label" bold style={styles.rightLabel}>
                            {rightLabel}
                        </Typography>
                    )
                )}
            </View>
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: SPACING.xxl,
    },
    heading: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-end",
        paddingHorizontal: SPACING.xl,
        marginBottom: SPACING.md,
    },
    titleContainer: {
        flex: 1,
    },
    title: {
        marginTop: SPACING.xs,
    },
    rightLabel: {
        marginBottom: 3,
    },
});
