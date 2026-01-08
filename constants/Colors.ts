const tintColorLight = "#0E5D66";
const tintColorDark = "#4FD1C5";

const lightBase = {
    bg: "#FDFBF7",
    text: "#0D1F23",
    muted: "#6B8185",
    mutedText: "#829699",
    border: "#E6EBEB",
};
const darkBase = {
    bg: "#051316",
    text: "#ECF4F5",
    muted: "#56696D",
    mutedText: "#6B8185",
    border: "#1A2C30",
};

export const COLORS = {
    light: {
        text: lightBase.text,
        background: lightBase.bg,
        tint: tintColorLight,
        icon: "#0E5D66",
        tabIconDefault: "#829699",
        tabIconSelected: tintColorLight,

        muted: lightBase.muted,
        mutedText: lightBase.mutedText,
        chipBorder: lightBase.border,
        badgeBg: "#FFF1E8",
        title: "#0D1F23",
        favorite: "#FFD166",
        success: "#2BB673",
        successLight: "#EAF9F0",
        danger: "#E63946",
        dangerLight: "#FFECEA",
        overlayBg: "rgba(13,31,35,0.12)",
        overlayText: "#0D1F23",
        dotGood: "#9DE1C0",
        dotBad: "#FFBDB4",
        statusDotBorder: "rgba(0,0,0,0.06)",
    },
    dark: {
        text: darkBase.text,
        background: darkBase.bg,
        tint: tintColorDark,
        icon: "#4FD1C5",
        tabIconDefault: "#56696D",
        tabIconSelected: tintColorDark,

        muted: darkBase.muted,
        mutedText: darkBase.mutedText,
        chipBorder: darkBase.border,
        badgeBg: "#08232A",
        title: "#ECF4F5",
        favorite: "#FFD166",
        success: "#2BB673",
        successLight: "#07321E",
        danger: "#E63946",
        dangerLight: "#3A0F0F",
        overlayBg: "rgba(0,0,0,0.6)",
        overlayText: "#FDFBF7",
        dotGood: "#59D7A6",
        dotBad: "#FF8F89",
        statusDotBorder: "rgba(255,255,255,0.06)",
    },
};
