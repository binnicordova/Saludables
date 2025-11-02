const tintColorLight = "#FF6B35";
const tintColorDark = "#FF6B35";

const lightBase = {
    bg: "#FFF8F2",
    text: "#2B2D32",
    muted: "#7A7D82",
    mutedText: "#8E9196",
    border: "#EFECEC",
};
const darkBase = {
    bg: "#0B1220",
    text: "#E6EEF1",
    muted: "#9AA3A7",
    mutedText: "#A8B0B3",
    border: "#16202A",
};

export const COLORS = {
    light: {
        text: lightBase.text,
        background: lightBase.bg,
        tint: tintColorLight,
        icon: "#155E63",
        tabIconDefault: "#6B6E73",
        tabIconSelected: tintColorLight,

        muted: lightBase.muted,
        mutedText: lightBase.mutedText,
        chipBorder: lightBase.border,
        badgeBg: "#FFF1E8",
        title: "#132028",
        favorite: "#FFD166",
        success: "#2BB673",
        successLight: "#EAF9F0",
        danger: "#E63946",
        dangerLight: "#FFECEA",
        overlayBg: "rgba(11,18,32,0.12)",
        overlayText: "#0B1220",
        dotGood: "#9DE1C0",
        dotBad: "#FFBDB4",
        statusDotBorder: "rgba(0,0,0,0.06)",
    },
    dark: {
        text: darkBase.text,
        background: darkBase.bg,
        tint: tintColorDark,
        icon: "#6FE3D1",
        tabIconDefault: "#9AA3A7",
        tabIconSelected: tintColorDark,

        muted: darkBase.muted,
        mutedText: darkBase.mutedText,
        chipBorder: darkBase.border,
        badgeBg: "#08232A",
        title: "#F7F5F3",
        favorite: "#FFD166",
        success: "#2BB673",
        successLight: "#07321E",
        danger: "#E63946",
        dangerLight: "#3A0F0F",
        overlayBg: "rgba(0,0,0,0.6)",
        overlayText: "#FFF8F2",
        dotGood: "#59D7A6",
        dotBad: "#FF8F89",
        statusDotBorder: "rgba(255,255,255,0.06)",
    },
};
