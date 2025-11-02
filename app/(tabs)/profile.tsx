import { Collapsible } from "@/components/Collapsible";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Image, Platform, StyleSheet } from "react-native";

export default function ProfileScreen() {
    return (
        <ParallaxScrollView
            headerBackgroundColor={{ light: "#D0D0D0", dark: "#353636" }}
            headerImage={
                <Image
                    source={require("@/assets/images/loading.gif")}
                    style={styles.headerImage}
                />
            }
        >
            <ThemedView style={styles.titleContainer}>
                <ThemedText type="title">Perfil</ThemedText>
            </ThemedView>
            <ThemedText>
                Los beneficios de usar SALUDABLES-ON para ver las playas,
                piscinas y restaurantes saludables incluyen:
            </ThemedText>
            <Collapsible title="Protege a tu familia" initialIsOpen>
                <ThemedText>
                    Mantén a tu familia segura eligiendo playas y piscinas que
                    cumplen con altos estándares de limpieza y seguridad.
                </ThemedText>
            </Collapsible>
            <Collapsible title="Conveniencia" initialIsOpen>
                <ThemedText>
                    Encuentra fácilmente las mejores playas, piscinas y
                    restaurantes saludables sin la molestia de una búsqueda
                    extensa.
                </ThemedText>
            </Collapsible>
            <Collapsible title="Beneficios para la salud" initialIsOpen>
                <ThemedText>
                    Accede a información sobre la limpieza y seguridad de playas
                    y piscinas, asegurando una experiencia más saludable.
                </ThemedText>
            </Collapsible>
            <Collapsible title="Ahorro de tiempo" initialIsOpen>
                <ThemedText>
                    Localiza rápidamente opciones de comida saludable cercanas,
                    ahorrando tiempo y esfuerzo en encontrar los mejores lugares
                    para comer.
                </ThemedText>
            </Collapsible>
            <Collapsible title="Certificación SALUDABLES-ON" initialIsOpen>
                <ThemedText>
                    Todos los lugares listados cuentan con la certificación de
                    SALUDABLES-ON, garantizando que cumplen con nuestros
                    estrictos estándares de salud y seguridad.
                </ThemedText>
            </Collapsible>
        </ParallaxScrollView>
    );
}

const styles = StyleSheet.create({
    headerImage: {
        width: "100%",
        height: Platform.OS === "web" ? 300 : 200,
        resizeMode: "cover",
    },
    titleContainer: {
        flexDirection: "row",
        gap: 8,
    },
});
