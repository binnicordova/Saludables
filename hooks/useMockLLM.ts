import { useCallback, useMemo, useState } from "react";

export type Message = {
    role: "user" | "assistant" | "system";
    content: string;
};

export const useMockLLM = (config: any) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [response, setResponse] = useState<string | null>(null);
    const [messageHistory, setMessageHistory] = useState<Message[]>([]);

    const isReady = true;

    const configure = useCallback((newConfig: any) => {
        console.log("Mock LLM configured", newConfig);
    }, []);

    const sendMessage = useCallback((message: string) => {
        setIsGenerating(true);
        setMessageHistory((prev) => [
            ...prev,
            { role: "user", content: message },
        ]);

        setTimeout(() => {
            const mockResponse =
                "¡Hola! Estoy en modo de demostración porque esta versión de la aplicación es compatible con Expo Go y no incluye el motor de IA local. Sin embargo, puedo decirte que las playas y piscinas saludables son fundamentales para un verano seguro.";
            setResponse(mockResponse);
            setMessageHistory((prev) => [
                ...prev,
                { role: "assistant", content: mockResponse },
            ]);
            setIsGenerating(false);
        }, 1500);
    }, []);

    return {
        isReady,
        isGenerating,
        response,
        messageHistory,
        sendMessage,
        configure,
    };
};

export const LLAMA3_2_1B_SPINQUANT = "mock-model";
export const useSpeechToText = () => ({
    isListening: false,
    startListening: () => {},
    stopListening: () => {},
    results: [],
});
export enum SpeechToTextLanguage {
    SPANISH = "es-ES",
}
