import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { shouldHideElementsAtom } from "@/store/atoms";
import { FlashList } from "@shopify/flash-list";
import { useAtom } from "jotai";
import React, { useRef } from "react";
import {
    ActivityIndicator,
    Platform,
    RefreshControl,
    View,
} from "react-native";
import type {
    FlatListProps,
    NativeScrollEvent,
    NativeSyntheticEvent,
} from "react-native";

type Props<T> = Omit<
    FlatListProps<T>,
    "scrollEventThrottle" | "refreshing" | "onRefresh"
> & {
    onScroll?: FlatListProps<T>["onScroll"];
    loading?: boolean; // Optional, defaults to false
    error?: string | null; // Optional, defaults to null
    refreshing?: boolean; // Optional, defaults to false
    onRefresh?: () => void; // Optional
    statusText?: string | null;
    data: readonly T[]; // Required, ensures data is properly typed
};

export default function List<T>({
    data, // Required
    loading = false,
    error = null,
    refreshing = false,
    onRefresh,
    statusText = null,
    ListHeaderComponent,
    ListEmptyComponent,
    contentContainerStyle,
    onScroll,
    ...restProps
}: Props<T>) {
    const [, setTabBarVisible] = useAtom(shouldHideElementsAtom);
    const lastOffsetRef = useRef<number>(0);
    const showTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleTabBarVisibility = (y: number, diff: number) => {
        if (y <= 0 || refreshing) {
            if (showTimeoutRef.current) {
                clearTimeout(showTimeoutRef.current);
                showTimeoutRef.current = null;
            }
            setTabBarVisible(true);
            return;
        }

        if (Math.abs(diff) < 5) return;

        if (diff > 0) {
            if (showTimeoutRef.current) {
                clearTimeout(showTimeoutRef.current);
                showTimeoutRef.current = null;
            }
            setTabBarVisible(false);
        } else {
            if (showTimeoutRef.current) {
                clearTimeout(showTimeoutRef.current);
                showTimeoutRef.current = null;
            }
            setTabBarVisible(true);
        }
    };

    const renderLoading = () => (
        <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
            <ActivityIndicator size="large" color="#0000ff" />
        </View>
    );

    const renderError = () => (
        <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
            <ThemedText>{`Error: ${error}`}</ThemedText>
        </View>
    );

    const defaultHeader = (
        <ThemedView style={{ paddingHorizontal: 16, gap: 4 }}>
            {statusText ? <ThemedText type="caption">{statusText}</ThemedText> : null}
            <ThemedText style={{ textAlign: "right" }}>
                {`${(data as readonly unknown[] | null)?.length ?? 0} resultados`}
            </ThemedText>
        </ThemedView>
    );

    const defaultEmpty = (
        <ThemedView
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
            <ThemedText>No se encontraron resultados</ThemedText>
        </ThemedView>
    );

    const mergedContentContainerStyle = [
        { paddingVertical: Platform.OS === "ios" ? 40 : 0 },
        contentContainerStyle,
    ];

    if (loading && data.length === 0) return renderLoading();
    if (error && data.length === 0) return renderError();

    return (
        <FlashList
            data={data} // No casting needed since data is required and properly typed
            refreshing={refreshing}
            onRefresh={onRefresh}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            ListHeaderComponent={ListHeaderComponent ?? defaultHeader}
            ListEmptyComponent={ListEmptyComponent ?? defaultEmpty}
            contentContainerStyle={mergedContentContainerStyle}
            onScroll={({ nativeEvent }: { nativeEvent: NativeScrollEvent }) => {
                const y = nativeEvent.contentOffset.y;
                const diff = y - lastOffsetRef.current;

                handleTabBarVisibility(y, diff);

                lastOffsetRef.current = y;

                if (onScroll) {
                    const syntheticEvent = {
                        nativeEvent,
                    } as NativeSyntheticEvent<NativeScrollEvent>;
                    onScroll(syntheticEvent);
                }
            }}
            scrollEventThrottle={16}
            {...restProps}
        />
    );
}
