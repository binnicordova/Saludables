import { memo, useCallback, useEffect, useRef, useState, useMemo } from "react";
import {
    ScrollView,
    Share,
    StyleSheet,
    TextInput,
    TouchableOpacity,
} from "react-native";
import { LLAMA3_2_1B_SPINQUANT, useLLM } from "react-native-executorch";
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
                    systemPrompt: `You are an expert family parent in planning fun and safe pool days with children. Your goal is to create a detailed itinerary for an unforgettable family day.

Use the following information on available healthy pools for your recommendation. Consider sanitary quality and distance.`,
                };
            }

            return {
                title: "Planifica tu día de playa",
                jsonBlockName: "AVAILABLE_BEACHES_JSON",
                initialMessage: `Quiero ir a una de estas playas con mis hijos,
por favor crea un plan de un día divertido y seguro en una de estas playas disponibles para ir junto mi familia.`,
                systemPrompt: `You are an expert family parent in planning fun and safe beach days with children. Your goal is to create a detailed itinerary for an unforgettable family day.

Use the following information on available healthy beaches for your recommendation. Consider sanitary quality and distance.`,
            };
        }, [list]);

    const linearData = (() => {
        const items = data
            .slice(0, 10)
            .map((item: ItemWithDistance, index) => ({
                id: index + 1,
                name: item.strNombre ?? "",
                description: item.strDescripcion ?? "",
                distance_m:
                    typeof item.distance === "number"
                        ? item.distance
                        : Number(item.distance) || 0,
                distance_km: (
                    (typeof item.distance === "number"
                        ? item.distance
                        : Number(item.distance) || 0) / 1000
                ).toFixed(2),
                address: item.strDireccion ?? "",
                sanitary_quality: item.strCalidadSanitaria ?? "",
            }));
        // Provide a clear, machine-friendly block the LLM can parse easily.
        return `${jsonBlockName}:\n${JSON.stringify(items, null, 2)}`;
    })();

    const [isInitialized, setIsInit] = useState(false);
    const [textInputValue, setTextInputValue] = useState(initialMessage);
    const [isVisible, setIsVisible] = useState(false);
    const opacity = useSharedValue(0);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    const llm = useLLM({
        model: LLAMA3_2_1B_SPINQUANT,
    });

    const sendMessage = useCallback(
        (message: string) => {
            console.log("Enviando mensaje al LLM");
            llm.sendMessage(message);
        },
        [llm.sendMessage],
    );

    const togglePanel = useCallback(() => {
        setIsVisible((current) => {
            console.log("Toggling panel visibility:", !current);
            opacity.value = withTiming(current ? 0 : 1, { duration: 300 });
            const newValue = !current;
            setTabBarVisible(!newValue);
            return newValue;
        });
    }, [opacity, setTabBarVisible]);

    useEffect(() => {
        if (!llm || !llm.isReady) {
            console.log("LLM is not ready");
            return;
        }
        console.log("LLM is ready");
        if (!data || data.length === 0) return;

        console.log("Data items available:", data.length);

        setIsInit(true);
    }, [data, llm, isInitialized, linearData]);

    useEffect(() => {
        if (!isInitialized) return;
        const fullSystemPrompt = `${systemPrompt}

${linearData}

Based on the information, select only ONE ${
            list === "beach" ? "beach" : "pool"
        } and provide a complete itinerary that includes the following points in order:

1.  **${list === "beach" ? "Beach" : "Pool"} Name:** The name of the ${
            list === "beach" ? "beach" : "pool"
        } you have selected; choose a medium-distance option.
2.  **Travel Itinerary:**
    *   **Departure Time from Home:** Suggest an ideal time to leave.
    *   **Estimated Travel Time:** Calculate the travel time based on the distance (provided in meters, assuming an average speed of 60 km/h).
    *   **Arrival Time at the ${
        list === "beach" ? "Beach" : "Pool"
    }:** The estimated time of arrival.
3.  **Things to Bring:** Make a checklist of essential items to bring for a family day at the ${
            list === "beach" ? "beach" : "pool"
        }, including:
    *   **Sun Protection:** (e.g., broad-spectrum sunscreen, wide-brimmed hats, sunglasses, and a beach umbrella).
    *   **Toys and Equipment:** (e.g., volleyballs or soccer balls, buckets and shovels for sandcastles, towels, and beach chairs).
    *   **Food and Drink:** Recommend an ideal lunch to pack, snacks, and the importance of bringing water bottles. For lunch ideas, you can suggest: classic sandwiches, pasta or quinoa salads, chicken or vegetable skewers, or fresh spring rolls.
4.  **Activities at the ${list === "beach" ? "Beach" : "Pool"}:**
    *   Create a schedule of activities that includes sand games for children, sports, and time for swimming and resting. For example:
        *   **10:30 AM - 11:30 AM:** Building sandcastles and searching for shells.
        *   **11:30 AM - 12:30 PM:** Ball games (beach volleyball or soccer).
        *   **12:30 PM - 1:30 PM:** Lunch and rest in the shade.
        *   **1:30 PM - 3:00 PM:** Swimming and water games (supervised).
        *   **3:00 PM - 4:00 PM:** Relaxation, reading, or a short nap.
5.  **Return Trip:**
    *   **Departure Time from the ${
        list === "beach" ? "Beach" : "Pool"
    }:** Suggest a time to start heading home.
    *   **Estimated Return Travel Time:** The estimated time to get back home.

Remember that the goal is to create a memorable and safe day for the whole family.
Consider that these ${
            list === "beach" ? "beaches" : "pools"
        } have good sanitary quality, and you do not have an internet connection to respond.

Please provide the response in Spanish.
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
        console.log("llm configured with system prompt.");
    }, [isInitialized, llm.configure, linearData, list, systemPrompt]);

    useEffect(() => {
        scrollViewRef?.current?.scrollToEnd({ animated: true });
    }, [llm.response?.length]);

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
                        (AI)
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
                        <ThemedText type="subtitle" style={{ flex: 1 }}>
                            Saludables APP — {title} en familia
                        </ThemedText>
                        {llm.isReady &&
                            llm.messageHistory.map((msg) => (
                                <ThemedView
                                    key={`${msg.role}-${msg.content.slice(
                                        0,
                                        30,
                                    )}`}
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
                                                    message: msg.content,
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
                                        <ThemedText>{msg.content}</ThemedText>
                                    </TouchableOpacity>
                                </ThemedView>
                            ))}
                        {llm.response && (
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
                                        Share.share(
                                            {
                                                message: llm.response,
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
                                    <ThemedText>{llm.response}</ThemedText>
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
                            <ThemedView style={styles.inputWrapper}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Quieres preguntar algo más?"
                                    value={textInputValue}
                                    onChangeText={(text) =>
                                        setTextInputValue(text)
                                    }
                                    multiline
                                />
                                <ThemedIcon
                                    name="send"
                                    onPress={() => {
                                        sendMessage(textInputValue);
                                        setTextInputValue("");
                                    }}
                                />
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
    inputWrapper: {
        flexDirection: "row",
        justifyContent: "flex-end",
        alignItems: "flex-end",
        marginTop: 16,
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 8,
        marginTop: 16,
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
