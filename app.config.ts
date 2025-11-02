import "dotenv/config";
import type { ExpoConfig } from "@expo/config-types";

const EAS_OWNER = process.env.EAS_OWNER; // by https://www.binnicordova.com
const EAS_SLUG = "saludables";
const EAS_PROJECT_ID = process.env.EAS_PROJECT_ID;

const VERSION = "0.0.15";
const VERSION_CODE = 15;

const APP_VARIANTS = {
    development: {
        identifier: "com.saludables.app.dev",
        name: "Saludables (Dev)",
        scheme: "dev.com.saludables.app",
    },
    preview: {
        identifier: "com.saludables.app.preview",
        name: "Saludables (Preview)",
        scheme: "preview.com.saludables.app",
    },
    production: {
        identifier: "com.saludables.app",
        name: "Saludables",
        scheme: "com.saludables.app",
    },
};

const getAppVariant = () => {
    if (process.env.APP_VARIANT === "development")
        return APP_VARIANTS.development;
    if (process.env.APP_VARIANT === "preview") return APP_VARIANTS.preview;
    return APP_VARIANTS.production;
};

const getUniqueIdentifier = () => getAppVariant().identifier;
const getAppName = () => getAppVariant().name;
const getScheme = () => getAppVariant().scheme;

export default ({ config }: { config: ExpoConfig }): ExpoConfig => ({
    ...config,
    name: getAppName(),
    scheme: getScheme(),
    slug: EAS_SLUG,
    version: VERSION,
    orientation: "portrait",
    icon: "./assets/icon.png",
    newArchEnabled: true,
    splash: {
        image: "./assets/splash.png",
        resizeMode: "contain",
        backgroundColor: "#ffffff",
    },
    updates: {
        fallbackToCacheTimeout: 0,
        url: `https://u.expo.dev/${EAS_PROJECT_ID}`,
        enabled: true,
    },
    assetBundlePatterns: ["**/*"],
    ios: {
        supportsTablet: true,
        bundleIdentifier: getUniqueIdentifier(),
        version: VERSION,
        infoPlist: {
            ITSAppUsesNonExemptEncryption: false,
            NSLocationWhenInUseUsageDescription:
                "Permito que $(PRODUCT_NAME) use mi ubicación exacta.",
        },
    },
    android: {
        adaptiveIcon: {
            foregroundImage: "./assets/adaptive-icon.png",
            backgroundColor: "#FFFFFF",
        },
        package: getUniqueIdentifier(),
        versionCode: VERSION_CODE,
        version: VERSION,
        permissions: [
            "android.permission.ACCESS_COARSE_LOCATION",
            "android.permission.ACCESS_FINE_LOCATION",
            "android.permission.ACCESS_COARSE_LOCATION",
            "android.permission.ACCESS_FINE_LOCATION",
        ],
    },
    web: {
        favicon: "./assets/favicon.png",
        bundler: "metro",
    },
    extra: {
        router: {
            origin: false,
        },
        eas: {
            projectId: EAS_PROJECT_ID,
        },
    },
    owner: EAS_OWNER,
    runtimeVersion: VERSION,
    userInterfaceStyle: "automatic",
    plugins: [
        "expo-router",
        [
            "expo-dev-client",
            {
                launchMode: "most-recent",
            },
        ],
        [
            "expo-splash-screen",
            {
                image: "./assets/splash.png",
                imageWidth: 200,
                resizeMode: "contain",
                backgroundColor: "#ffffff",
            },
        ],
        [
            "expo-location",
            {
                locationAlwaysAndWhenInUsePermission:
                    "Permito que $(PRODUCT_NAME) use mi ubicación exacta.",
            },
        ],
    ],
    experiments: {
        typedRoutes: true,
    },
});
