import { useFonts } from "expo-font";
import { Slot, useGlobalSearchParams, router } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { Provider as JotaiProvider, useAtomValue, useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { getAllListDataAtom, refreshListDataAtom } from "@/atoms/listAtom";
import { addCartItemAtom, clearCartAtom } from "@/atoms/cart";
import { decodeQueryToItems } from "@/utils/cartDeepLink";
import type { ListType } from "@/services/storage";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function CartDeepLinkHandler() {
    const params = useGlobalSearchParams<{ import?: string }>();
    const importParam = params?.import;
    const availablePlaces = useAtomValue(getAllListDataAtom);
    const addCartItem = useSetAtom(addCartItemAtom);
    const clearCart = useSetAtom(clearCartAtom);
    const refreshPlaces = useSetAtom(refreshListDataAtom);
    const [processedParam, setProcessedParam] = useState<string | null>(null);

    // Warm up categories cache from deep link immediately on startup, so images & list details load perfectly
    useEffect(() => {
        if (!importParam || importParam === processedParam) return;

        const pairs = importParam.split("|");
        const categoriesToLoad = new Set<string>();
        for (const pair of pairs) {
            const [cat] = pair.split(":");
            if (cat) categoriesToLoad.add(cat);
        }

        for (const cat of categoriesToLoad) {
            refreshPlaces(cat as ListType);
        }
    }, [importParam, refreshPlaces, processedParam]);

    // Handle Deep Link Import with visual confirmation prompt
    useEffect(() => {
        if (!importParam || importParam === processedParam || availablePlaces.length === 0) return;

        const importedItems = decodeQueryToItems(importParam, availablePlaces);

        if (importedItems.length === 0) {
            return;
        }

        setProcessedParam(importParam);

        Alert.alert(
            "📍 Plan saludable compartido",
            `Se han detectado ${importedItems.length} lugares saludables en el enlace recibido.\n\n¿Qué te gustaría hacer con ellos?`,
            [
                {
                    text: "Combinar con mi plan",
                    onPress: () => {
                        for (const { item, category } of importedItems) {
                            addCartItem(item, category);
                        }
                        router.replace("/cart");
                    },
                },
                {
                    text: "Reemplazar mi plan actual",
                    style: "destructive",
                    onPress: () => {
                        clearCart();
                        for (const { item, category } of importedItems) {
                            addCartItem(item, category);
                        }
                        router.replace("/cart");
                    },
                },
                {
                    text: "Cancelar",
                    style: "cancel",
                    onPress: () => {
                        router.replace("/cart");
                    },
                },
            ]
        );
    }, [importParam, availablePlaces, addCartItem, clearCart, processedParam]);

    return null;
}

export default function RootLayout() {
    const [loaded] = useFonts({
        SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    });

    useEffect(() => {
        if (loaded) {
            SplashScreen.hideAsync();
        }
    }, [loaded]);

    if (!loaded) {
        return null;
    }

    return (
        <JotaiProvider>
            <CartDeepLinkHandler />
            <Slot />
            <StatusBar style="auto" />
        </JotaiProvider>
    );
}
