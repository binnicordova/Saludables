import { memo, useCallback, useEffect, useRef, useState, useMemo } from "react";
import {
    ScrollView,
    Share,
    StyleSheet,
    TextInput,
    TouchableOpacity,
} from "react-native";
import {
    LLAMA3_2_1B_SPINQUANT,
    useLLM,
    useSpeechToText,
    SpeechToTextLanguage,
} from "react-native-executorch";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";
import { Animation } from "./Animation";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";
import type { ItemWithDistance } from "@/services/models/Item";
import { ThemedIcon } from "./ThemedIcon";
import { shouldHideElementsAtom } from "@/store/atoms";
import { useSetAtom } from "jotai";

const ICON_SIZE = 100;
const MAX_HEIGHT = 300;

type SmarthPlanifierType = {
    data: ItemWithDistance[];
    list: "pool" | "beach";
};

export const SmarthPlanifier = ({ data, list }: SmarthPlanifierType) => {
    const setTabBarVisible = useSetAtom(shouldHideElementsAtom);
    const scrollViewRef = useRef<ScrollView>(null);

    const { title, jsonBlockName, initialMessage, systemPrompt } =
        useMemo(() => {
            if (list === "pool") {
                return {
                    title: "Planifica tu día de piscina",
                    jsonBlockName: "AVAILABLE_POOLS_JSON",
                    initialMessage: `Quiero ir a una de estas piscinas con mis hijos,
por favor crea un plan de un día divertido y seguro en una de estas piscinas disponibles para ir junto mi familia.`,
                    systemPrompt:
                        "Eres un asistente experto en planificar días familiares seguros y divertidos en piscinas. Usa la información de piscinas disponibles y su calidad sanitaria para recomendar y crear un itinerario detallado. Habla en un tono amable y cercano con el usuario.",
                };
            }

            return {
                title: "Planifica tu día de playa",
                jsonBlockName: "AVAILABLE_BEACHES_JSON",
                initialMessage: `Quiero ir a una de estas playas con mis hijos,
por favor crea un plan de un día divertido y seguro en una de estas playas disponibles para ir junto mi familia.`,
                systemPrompt:
                    "Eres un asistente experto en planificar días familiares seguros y divertidos en playas. Usa la información de playas disponibles y su calidad sanitaria para recomendar y crear un itinerario detallado. Habla en un tono amable y cercano con el usuario.",
            };
        }, [list]);

    const linearData = useMemo(() => {
        const items = data.slice(0, 10).map((item: ItemWithDistance, index) => {
            const distance_m = Math.round(item.distance ?? 0);
            const distance_km = Math.round((distance_m / 1000) * 100) / 100;

            return {
                id: index + 1,
                name: item.strNombre ?? "",
                distance_m,
                distance_km,
            };
        });

        const payload = { items };
        return `${jsonBlockName}:\n${JSON.stringify(payload, null, 2)}`;
    }, [data, jsonBlockName]);

    const [isInitialized, setIsInit] = useState(false);
    const [textInputValue, setTextInputValue] = useState(initialMessage);
    const [isVisible, setIsVisible] = useState(false);
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(20);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateY: translateY.value }],
    }));

    const llmConfig = useMemo(
        () => ({
            model: LLAMA3_2_1B_SPINQUANT,
        }),
        [],
    );

    const llm = useLLM(llmConfig);

    const sendMessage = useCallback(
        (message: string) => {
            console.log("Enviando mensaje al LLM");
            try {
                if (llm && typeof llm.sendMessage === "function") {
                    llm.sendMessage(message);
                } else {
                    console.warn("LLM sendMessage not available");
                }
            } catch (e) {
                console.error("Error sending message to LLM:", e);
            }
        },
        [llm],
    );

    const togglePanel = useCallback(() => {
        setIsVisible((current) => {
            console.log("Toggling panel visibility:", !current);
            opacity.value = withTiming(current ? 0 : 1, { duration: 300 });
            translateY.value = withTiming(current ? 20 : 0, { duration: 300 });
            const newValue = !current;
            setTabBarVisible(!newValue);
            return newValue;
        });
    }, [opacity, translateY, setTabBarVisible]);
    useEffect(() => {
        if (isInitialized) return;
        if (!llm || !llm.isReady) {
            console.log("LLM is not ready");
            return;
        }
        console.log("LLM is ready");
        if (!data || data.length === 0) return;

        console.log("Data items available:", data.length);

        setIsInit(true);
    }, [data, llm, isInitialized]);

    useEffect(() => {
        if (!isInitialized) return;
        const fullSystemPrompt = `${systemPrompt}

    ${linearData}

    RESPONDER SOLO UN JSON:

    - Selecciona 1 o 3 ${list === "beach" ? "playas" : "piscinas"} como opciones.
    - Calcula tiempo (1 km = 1 min). Usa 'distance_km' o 'distance_m'.
    - Salida JSON con: selected_name (string), selected_distance_m (number), selected_distance_km (number), travel_itinerary { departure_time: "HH:MM", estimated_travel_time_min: number, arrival_time: "HH:MM" }, things_to_bring [string], activities [{ time: "HH:MM-HH:MM", activity: string }], return_trip { departure_time: "HH:MM", estimated_travel_time_min: number }, notes (string breve con cierre amistoso).
    - Caracteristicas especiales para niños.
    - Formato 24h. Responde en español y no añadas texto fuera del JSON.
    `;

        llm.configure({
            chatConfig: {
                systemPrompt: fullSystemPrompt,
                contextWindowLength: 2048,
                initialMessageHistory: [
                    {
                        role: "system",
                        content: `Soy Saludables app AI,
tu asistente para planificar días de ${
                            list === "beach" ? "playa" : "piscina"
                        } en familia.
Preguntame lo que quieras sobre las ${
                            list === "beach" ? "playas" : "piscinas"
                        } SALUDABLES.`,
                    },
                ],
            },
        });
        console.log("llm configured with optimized system prompt.");
    }, [isInitialized, llm.configure, linearData, list, systemPrompt]);

    useEffect(() => {
        llm.response && scrollViewRef?.current?.scrollToEnd({ animated: true });
    }, [llm.response]);

    if (!llm.isReady || data.length === 0) {
        return null;
    }

    return (
        <>
            <TouchableOpacity style={styles.iconWrapper} onPress={togglePanel}>
                <>
                    <Animation
                        source={require("../assets/animations/ai-logo-foriday.json")}
                        style={{ width: ICON_SIZE, height: ICON_SIZE }}
                    />
                    <ThemedText type="subtitle" style={styles.text}>
                        IA
                    </ThemedText>
                </>
            </TouchableOpacity>
            <Animated.View style={[styles.panelWrapper, animatedStyle]}>
                <ThemedView style={styles.panel}>
                    <ScrollView
                        ref={scrollViewRef}
                        showsVerticalScrollIndicator={false}
                        style={styles.scrollView}
                    >
                        <ThemedView style={styles.header}>
                            <ThemedText
                                type="subtitle"
                                style={styles.headerTitle}
                            >
                                {title}
                            </ThemedText>
                            <ThemedIcon
                                name={isVisible ? "close" : "chevron-up"}
                                onPress={togglePanel}
                            />
                        </ThemedView>
                        <ThemedText
                            type="caption"
                            style={styles.headerSubtitle}
                        >
                            Planifica rápidamente actividades y recomendaciones.
                        </ThemedText>

                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.chipsContent}
                            style={styles.chipsRow}
                        >
                            {[
                                "Itinerario familiar",
                                "Cosas para llevar",
                                "Actividades seguras",
                            ].map((chip) => (
                                <TouchableOpacity
                                    key={chip}
                                    style={styles.chip}
                                    onPress={() => setTextInputValue(chip)}
                                >
                                    <ThemedText>{chip}</ThemedText>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                        {llm.isReady &&
                            llm.messageHistory.map((msg, idx) => {
                                const rawContent = msg && (msg).content;
                                const contentStr =
                                    typeof rawContent === "string"
                                        ? rawContent
                                        : rawContent
                                          ? JSON.stringify(rawContent)
                                          : "";
                                const key = `${msg.role ?? "msg"}-${
                                    contentStr.slice(0, 30) || idx
                                }`;

                                return (
                                    <ThemedView
                                        key={key}
                                        style={[
                                            styles.messageContainer,
                                            msg.role === "user"
                                                ? styles.userMessageContainer
                                                : styles.assistantMessageContainer,
                                        ]}
                                    >
                                        <ThemedText style={styles.roleText}>
                                            {msg.role === "user"
                                                ? "Tú"
                                                : "Saludables APP AI Asistente"}
                                        </ThemedText>
                                        <TouchableOpacity
                                            onPress={() => {
                                                Share.share(
                                                    {
                                                        message: contentStr,
                                                        title: "Compartir mensaje",
                                                    },
                                                    {
                                                        dialogTitle:
                                                            "Compartir mensaje",
                                                    },
                                                ).catch((error) => {
                                                    console.warn(
                                                        "Share error:",
                                                        error,
                                                    );
                                                });
                                            }}
                                        >
                                            <ThemedText>
                                                {contentStr}
                                            </ThemedText>
                                        </TouchableOpacity>
                                    </ThemedView>
                                );
                            })}
                        {llm.response && !llm.isReady && (
                            <ThemedView
                                style={[
                                    styles.messageContainer,
                                    styles.assistantMessageContainer,
                                ]}
                            >
                                <ThemedText style={styles.roleText}>
                                    Saludables APP AI Asistente
                                </ThemedText>
                                <TouchableOpacity
                                    onPress={() => {
                                        const resp =
                                            typeof llm.response === "string"
                                                ? llm.response
                                                : JSON.stringify(llm.response);
                                        Share.share(
                                            {
                                                message: resp,
                                                title: "Compartir respuesta de AI",
                                            },
                                            {
                                                dialogTitle:
                                                    "Compartir respuesta de AI",
                                            },
                                        ).catch((error) => {
                                            console.warn("Share error:", error);
                                        });
                                    }}
                                >
                                    <ThemedText>
                                        {typeof llm.response === "string"
                                            ? llm.response
                                            : JSON.stringify(llm.response)}
                                    </ThemedText>
                                </TouchableOpacity>
                            </ThemedView>
                        )}
                        {llm.isGenerating && (
                            <Animation
                                source={require("../assets/animations/ai-loading-model.json")}
                                style={{
                                    width: 50,
                                    height: 50,
                                    backgroundColor: "transparent",
                                    alignSelf: "center",
                                }}
                            />
                        )}
                        {!llm.isGenerating && (
                            <ThemedView style={styles.inputBar}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="¿Quieres preguntar algo más?"
                                    value={textInputValue}
                                    onChangeText={(text) =>
                                        setTextInputValue(text)
                                    }
                                    multiline
                                    accessible
                                    accessibilityLabel={
                                        "Entrada de texto para preguntar al asistente"
                                    }
                                />
                                <TouchableOpacity
                                    accessibilityRole="button"
                                    onPress={() => {
                                        if (textInputValue.trim().length === 0)
                                            return;
                                        sendMessage(textInputValue);
                                        setTextInputValue("");
                                    }}
                                    style={styles.sendButton}
                                >
                                    <ThemedIcon name="send" />
                                </TouchableOpacity>
                            </ThemedView>
                        )}
                    </ScrollView>
                </ThemedView>
            </Animated.View>
        </>
    );
};

const styles = StyleSheet.create({
    iconWrapper: {
        position: "absolute",
        left: 16,
        right: 16,
        top: 40,
        zIndex: 999,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 24,
        width: 50,
        height: 50,
        textAlign: "center",
        backgroundColor: "rgba(255, 255, 255, 0.1)",
    },
    text: {
        position: "absolute",
    },
    panelWrapper: {
        position: "absolute",
        left: 16,
        right: 16,
        top: 60,
        zIndex: 998,
    },
    panel: {
        borderRadius: 24,
        padding: 16,
    },
    scrollView: {
        maxHeight: MAX_HEIGHT,
        marginTop: 16,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 4,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: "700",
    },
    headerSubtitle: {
        marginTop: 6,
        marginBottom: 8,
        color: "#666",
    },
    chipsRow: {
        marginBottom: 8,
    },
    chipsContent: {
        flexDirection: "row",
        paddingHorizontal: 4,
        alignItems: "center",
    },
    chip: {
        backgroundColor: "rgba(0,0,0,0.06)",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20,
        marginRight: 8,
    },
    inputBar: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 12,
        padding: 8,
        borderRadius: 20,
        backgroundColor: "rgba(0,0,0,0.03)",
    },
    sendButton: {
        marginLeft: 8,
        padding: 8,
        borderRadius: 16,
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 8,
        marginTop: 0,
    },
    messageContainer: {
        borderRadius: 12,
        padding: 10,
        marginVertical: 4,
        maxWidth: "85%",
    },
    userMessageContainer: {
        alignSelf: "flex-end",
        backgroundColor: "#dcf8c6",
    },
    assistantMessageContainer: {
        alignSelf: "flex-start",
        backgroundColor: "#f1f0f0",
    },
    roleText: {
        fontWeight: "bold",
        marginBottom: 4,
        fontSize: 12,
    },
});
