import { favoritesAtom } from "@/atoms/listAtom";
import { currentLocationAtom } from "@/atoms/location";
import { Collapsible } from "@/components/Collapsible";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedIcon } from "@/components/ThemedIcon";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import Constants from "expo-constants";
import { Image } from "expo-image";
import * as Linking from "expo-linking";
import { useAtomValue } from "jotai";
import { Platform, Pressable, StyleSheet, View } from "react-native";

export default function ProfileScreen() {
    const favorites = useAtomValue(favoritesAtom) || [];
    const location = useAtomValue(currentLocationAtom);
    const version =
        // expo constants can provide version in different fields depending on runtime
        (Constants.manifest && (Constants.manifest as any).version) ||
        (Constants.expoConfig && (Constants.expoConfig.version as string)) ||
        Constants.manifestVersion ||
        "0.0.0";

    const openSupport = () => {
        Linking.openURL(
            "mailto:soporte@saludables.app?subject=Soporte%20SALUDABLES",
        );
    };

    const openPolicy = () => {
        // if you host policies externally replace the URL below
        Linking.openURL("https://example.com/policy");
    };

    return (
        <ParallaxScrollView
            headerBackgroundColor={{ light: "#D0D0D0", dark: "#353636" }}
            headerImage={
                <Image
                    source={require("@/assets/images/banner.png")}
                    style={styles.headerImage}
                    contentFit="cover"
                />
            }
        >
            <ThemedView style={styles.titleContainer}>
                <ThemedText type="title">Perfil</ThemedText>
            </ThemedView>

            <ThemedText style={styles.lead}>
                Bienvenido a SALUDABLES — aquí puedes revisar tu cuenta, accesos
                rápidos y la información de la app.
            </ThemedText>

            <Collapsible title="Cuenta" initialIsOpen>
                <View style={styles.row}>
                    <ThemedIcon
                        name="account-outline"
                        size={20}
                        style={styles.icon}
                    />
                    <ThemedText>Usuario anónimo</ThemedText>
                </View>
                <View style={styles.row}>
                    <ThemedIcon
                        name="pin-outline"
                        size={20}
                        style={styles.icon}
                    />
                    <ThemedText>
                        {location
                            ? `${location.coords.latitude.toFixed(3)}, ${location.coords.longitude.toFixed(3)}`
                            : "Ubicación no disponible"}
                    </ThemedText>
                </View>
            </Collapsible>

            <Collapsible title="Favoritos">
                <View style={styles.row}>
                    <ThemedIcon
                        name="heart-outline"
                        size={20}
                        style={styles.icon}
                    />
                    <ThemedText>
                        {favorites.length} lugares guardados
                    </ThemedText>
                </View>
                <ThemedText style={styles.hint}>
                    Los favoritos te permiten acceder rápidamente a tus lugares
                    preferidos.
                </ThemedText>
            </Collapsible>

            <Collapsible title="Información de la app">
                <View style={styles.row}>
                    <ThemedIcon
                        name="information-outline"
                        size={20}
                        style={styles.icon}
                    />
                    <ThemedText>Versión: {version}</ThemedText>
                </View>
                <View style={styles.row}>
                    <ThemedIcon name="cloud" size={20} style={styles.icon} />
                    <ThemedText>Sincronización automática de datos</ThemedText>
                </View>
            </Collapsible>

            <Collapsible title="Soporte & Políticas">
                <View style={styles.row}>
                    <Pressable onPress={openSupport} style={styles.actionBtn}>
                        <ThemedIcon
                            name="email-outline"
                            size={18}
                            style={styles.actionIcon}
                        />
                        <ThemedText style={styles.actionText}>
                            Contactar soporte
                        </ThemedText>
                    </Pressable>
                </View>
                <View style={styles.row}>
                    <Pressable onPress={openPolicy} style={styles.actionBtn}>
                        <ThemedIcon
                            name="file-document-outline"
                            size={18}
                            style={styles.actionIcon}
                        />
                        <ThemedText style={styles.actionText}>
                            Política de privacidad
                        </ThemedText>
                    </Pressable>
                </View>
            </Collapsible>
        </ParallaxScrollView>
    );
}

const styles = StyleSheet.create({
    headerImage: {
        width: "100%",
        height: "100%",
    },
    titleContainer: {
        flexDirection: "row",
        gap: 8,
    },
    lead: {
        fontSize: 14,
        lineHeight: 20,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginVertical: 6,
    },
    icon: {
        opacity: 0.9,
    },
    hint: {
        marginTop: 8,
        fontSize: 12,
        color: "#888",
    },
    actionBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingVertical: 6,
    },
    actionIcon: {
        opacity: 0.9,
    },
    actionText: {
        fontSize: 14,
    },
});
