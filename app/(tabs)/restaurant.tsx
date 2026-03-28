import {
    getRestaurantListDataAtom,
    restaurantDownloadStateAtom,
    refreshListDataAtom,
} from "@/atoms/listAtom";
import HealthDetail from "@/components/HealthDetail";
import List from "@/components/List";
import { SmarthPlanifier } from "@/components/SmarthPlanifier";
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect, useMemo } from "react";

export default function RestaurantScreen() {
    const dataItems = useAtomValue(getRestaurantListDataAtom);
    const downloadState = useAtomValue(restaurantDownloadStateAtom);

    const refreshData = useSetAtom(refreshListDataAtom);

    const statusText = useMemo(() => {
        if (downloadState.isRefreshing) {
            return "Actualizando datos...";
        }

        if (downloadState.error && dataItems.length > 0) {
            return "Mostrando datos guardados (sin conexión)";
        }

        if (downloadState.source === "cache-stale") {
            return "Mostrando datos guardados mientras se restablece la conexión";
        }

        if (downloadState.lastUpdated) {
            const formatted = new Date(
                downloadState.lastUpdated,
            ).toLocaleString();
            return `Última actualización: ${formatted}`;
        }

        return null;
    }, [downloadState, dataItems.length]);

    useEffect(() => {
        refreshData("restaurant");
    }, [refreshData]);

    return (
        <>
            <SmarthPlanifier data={dataItems} list="restaurant" />
            <List
                onRefresh={() => refreshData("restaurant")}
                refreshing={downloadState.isRefreshing}
                loading={downloadState.isLoading}
                error={downloadState.error ?? undefined}
                statusText={statusText}
                data={dataItems}
                keyExtractor={(item, index) => `${item.id}-${index}`}
                renderItem={({ item }) => <HealthDetail {...item} />}
            />
        </>
    );
}
