import { StyleSheet, Text, type TextProps } from "react-native";
import { COLORS } from "@/constants/theme";

interface TypographyProps extends TextProps {
  variant?: "h1" | "h2" | "h3" | "body" | "bodySmall" | "eyebrow" | "label";
  color?: string;
  bold?: boolean;
}

export const Typography = ({ 
  variant = "body", 
  color, 
  bold, 
  style, 
  ...props 
}: TypographyProps) => {
  const textStyles = [
    styles.base,
    styles[variant],
    color && { color },
    bold && styles.bold,
    style,
  ];

  return <Text style={textStyles} {...props} />;
};

const styles = StyleSheet.create({
  base: {
    color: COLORS.ink,
  },
  bold: {
    fontWeight: "800",
  },
  h1: {
    fontSize: 34,
    lineHeight: 39,
    fontWeight: "800",
    letterSpacing: -1.1,
  },
  h2: {
    fontSize: 27,
    lineHeight: 32,
    fontWeight: "800",
    letterSpacing: -0.7,
  },
  h3: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.6,
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
  },
  bodySmall: {
    fontSize: 12,
    lineHeight: 17,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.2,
    color: COLORS.primary,
    textTransform: "uppercase",
  },
  label: {
    fontSize: 11,
    color: COLORS.muted,
  },
});
