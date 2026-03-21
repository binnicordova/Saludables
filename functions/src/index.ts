import { initializeApp } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";

initializeApp();

import { onRequest } from "firebase-functions/v2/https";
import { onSchedule } from "firebase-functions/v2/scheduler";

import type { Item } from "./Item";
import { digesaService } from "./digesa";

const DETAIL_BATCH_SIZE = 10;
const FUNCTION_TIMEOUT_SECONDS = 540;

type DataFile = {
    status: number;
    data: Item[];
    updated: string;
    count: number;
};

const updateFile = async (
    list: "pool" | "beach",
    data: DataFile,
): Promise<boolean> => {
    const bucket = getStorage().bucket();
    const filePath = `data/digesa-${list}.json`;
    const file = bucket.file(filePath);
    try {
        await file.save(JSON.stringify(data), {
            contentType: "application/json",
            public: true,
        });
        await file.makePublic();
        console.log(`File ${filePath} updated successfully.`);
        console.log(`File is publicly available at ${file.publicUrl()}`);
        return true;
    } catch (error) {
        console.error(`Error updating file ${filePath}:`, error);
        return false;
    }
};

const updateRemoteData = async (
    list: "pool" | "beach" = "pool",
): Promise<DataFile> => {
    const file = {
        status: 200,
        data: [] as Item[],
        updated: new Date().toISOString(),
        count: 0,
    };
    const items = await digesaService.list(list);
    if (items.length === 0) {
        throw new Error("No items fetched from DIGESA service.");
    }

    const results: PromiseSettledResult<Item>[] = [];
    for (let i = 0; i < items.length; i += DETAIL_BATCH_SIZE) {
        const batch = items.slice(i, i + DETAIL_BATCH_SIZE);
        console.log(
            `Fetching detail batch ${Math.floor(i / DETAIL_BATCH_SIZE) + 1} of ${Math.ceil(items.length / DETAIL_BATCH_SIZE)}`,
        );
        const batchResults = await Promise.allSettled(
            batch.map((item) => digesaService.item(item.id, list)),
        );
        results.push(...batchResults);
    }

    const detailedItems = results
        .filter((result): result is PromiseFulfilledResult<Item> => {
            if (result.status === "rejected") {
                console.error("Failed to fetch item detail:", result.reason);
                return false;
            }
            return true;
        })
        .map((result) => result.value)
        .filter((item: Item) => item.strLatitud && item.strLongitud);

    if (detailedItems.length < 5) {
        throw new Error(
            "Insufficient detailed items fetched from DIGESA service.",
        );
    }

    file.data = detailedItems;
    file.count = file.data.length;
    console.log(
        `Updated remote file with ${file.count} INDIVIDUAL items in comparison to ${items.length} fetched items from LIST.`,
    );
    return file;
};

const refreshPoolItemsData = async () => {
    console.log("Starting pool items data update...");
    const type = "pool";
    const dataFile = await updateRemoteData(type);
    await updateFile(type, dataFile);
    console.info("Pool items data update completed.");
    return dataFile;
};

const refreshBeachItemsData = async () => {
    console.log("Starting beach items data update...");
    const type = "beach";
    const dataFile = await updateRemoteData(type);
    await updateFile(type, dataFile);
    console.info("Beach items data update completed.");
    return dataFile;
};

// EveryDay at 2:05 AM
export const updatePoolItemsData = onSchedule(
    {
        schedule: "5 2 * * *",
        timeoutSeconds: FUNCTION_TIMEOUT_SECONDS,
    },
    async () => {
        await refreshPoolItemsData();
    },
);

// EveryDay at 2:10 AM
export const updateBeachItemsData = onSchedule(
    {
        schedule: "10 2 * * *",
        timeoutSeconds: FUNCTION_TIMEOUT_SECONDS,
    },
    async () => {
        await refreshBeachItemsData();
    },
);

export const refreshPoolItems = onRequest(
    { timeoutSeconds: FUNCTION_TIMEOUT_SECONDS },
    async (request, response) => {
        await refreshPoolItemsData();
        response.send("Pool items data refresh completed.");
    },
);

export const refreshBeachItems = onRequest(
    { timeoutSeconds: FUNCTION_TIMEOUT_SECONDS },
    async (request, response) => {
        await refreshBeachItemsData();
        response.send("Beach items data refresh completed.");
    },
);
