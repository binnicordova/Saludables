import {
    errorAtom,
    getPoolListDataAtom,
    isLoadingAtom,
    refreshListDataAtom,
} from "@/atoms/listAtom";
import HealthDetail from "@/components/HealthDetail";
import List from "@/components/List";
import { SmarthPlanifier } from "@/components/SmarthPlanifier";
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect } from "react";

export default function HomeScreen() {
    const isLoadingValue = useAtomValue(isLoadingAtom);
    const error = useAtomValue(errorAtom);
    const dataItems = useAtomValue(getPoolListDataAtom);

    const refreshData = useSetAtom(refreshListDataAtom);

    useEffect(() => {
        refreshData("pool");
    }, [refreshData]);

    return (
        <>
            <SmarthPlanifier data={dataItems} list="pool" />
            <List
                loading={isLoadingValue}
                error={error ?? undefined}
                data={dataItems}
                keyExtractor={(item, index) => `${item.id}-${index}`}
                renderItem={({ item }) => <HealthDetail {...item} />}
            />
        </>
    );
}
