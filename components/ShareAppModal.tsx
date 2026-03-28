import {
    markShareModalAsClosedAtom,
    markShareModalAsCompletedAtom,
    shouldShowShareModalAtom,
} from "@/atoms/shareModalAtom";
import { shareAssetImage, shareText } from "@/utils/shareUtils";
import { MaterialIcons } from "@expo/vector-icons";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { loadable } from "jotai/utils";
import React, { useEffect, useState } from "react";
import {
    Alert,
    Image,
    Modal,
    StyleSheet,
    TouchableOpacity,
} from "react-native";

const shareModalLoadable = loadable(shouldShowShareModalAtom);
const PROMO_BANNER = require("@/assets/images/10OFF-promo.png");

export function ShareAppModal() {
    const shouldShowState = useAtomValue(shareModalLoadable);
    const markAsClosed = useSetAtom(markShareModalAsClosedAtom);
    const markAsCompleted = useSetAtom(markShareModalAsCompletedAtom);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (
            shouldShowState.state === "hasData" &&
            shouldShowState.data &&
            !isVisible
        ) {
            setIsVisible(true);
        }
    }, [shouldShowState, isVisible]);

    const close = () => {
        markAsClosed();
        setIsVisible(false);
    };

    const completeShare = () => {
        markAsCompleted();
        setIsVisible(false);
    };

    const share = async () => {
        const shared = await shareText(
            `🏖️🏕️🏊 🌟 Cuida la salud de tu familia este verano 🌟 🏖️🏕️🏊
con la App Veranos "Saludables"!

🏖️ Playas, 🏕️ camping y 🏊 piscinas con calidad sanitaria certificada.
🤖 Planifica tu día perfecto con nuestro asistente inteligente: actividades divertidas y recomendaciones personalizadas.

🛜 Funciona sin internet • 💸 Gratis • 📍 Información en tiempo real en tu celular
👨‍👩‍👧‍👦 Diseña actividades seguras y saludables para toda la familia

🌴 Disfruta la playa, camping o piscina con tranquilidad y seguridad.
📲 Descarga ahora y participa por un viaje todo pagado a la playa para 7 personas!

👉 https://play.google.com/store/apps/details?id=com.saludables.app`,
            "https://play.google.com/store/apps/details?id=com.saludables.app",
            "Comparte la App Verano Saludable",
        );

        if (shared) {
            await new Promise((resolve) => setTimeout(resolve, 3000));
            Alert.alert(
                "Good!, ahora comparte la imagen promocional",
                "Gana mayor oportunidad en el sorteo compartiendo la imagen promocional",
                [
                    {
                        text: "Sí, compartir imagen",
                        onPress: async () => {
                            if (
                                await shareAssetImage(
                                    PROMO_BANNER,
                                    "beach-promo.png",
                                    "Comparte Verano Saludable",
                                )
                            ) {
                                completeShare();
                            }
                        },
                    },
                ],
            );
        }
    };

    if (!isVisible) return null;

    return (
        <Modal transparent visible animationType="fade" onRequestClose={close}>
            <TouchableOpacity
                style={styles.overlay}
                activeOpacity={1}
                onPress={close}
            >
                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={share}
                    style={styles.card}
                >
                    <Image
                        source={PROMO_BANNER}
                        style={styles.img}
                        resizeMode="contain"
                    />
                    <TouchableOpacity style={styles.close} onPress={close}>
                        <MaterialIcons name="close" size={24} color="white" />
                    </TouchableOpacity>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.7)",
    },
    card: {
        width: "90%",
        maxWidth: 450,
        aspectRatio: 1024 / 1536,
        borderRadius: 20,
        overflow: "hidden",
        backgroundColor: "white",
        elevation: 5,
    },
    img: { width: "100%", height: "100%" },
    close: {
        position: "absolute",
        top: 15,
        right: 15,
        backgroundColor: "rgba(0,0,0,0.3)",
        borderRadius: 20,
        padding: 5,
    },
});
