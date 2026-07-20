import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
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

type StorageListType = "pool" | "beach" | "hotel" | "restaurant" | "tourism";
type PlaceCollectionType = "hotels" | "restaurants" | "tourisms";

const firestore = getFirestore();

const COLLECTION_TO_LIST_TYPE: Record<PlaceCollectionType, StorageListType> = {
    hotels: "hotel",
    restaurants: "restaurant",
    tourisms: "tourism",
};

const setCorsHeaders = (response: { set: (field: string, value: string) => void }) => {
    response.set("Access-Control-Allow-Origin", "*");
    response.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    response.set("Access-Control-Allow-Headers", "Content-Type");
};

const parseItem = (payload: unknown): Item => {
    if (!payload || typeof payload !== "object") {
        throw new Error("Item payload is required.");
    }

    const rawItem = payload as Partial<Item>;
    return {
        ...rawItem,
        aControles: Array.isArray(rawItem.aControles) ? rawItem.aControles : [],
    } as Item;
};

const parsePlaceCollectionType = (value: unknown): PlaceCollectionType => {
    if (value === "hotels" || value === "restaurants" || value === "tourisms") {
        return value;
    }
    throw new Error("Field 'type' must be one of: hotels, restaurants, tourisms.");
};

const updateFile = async (
    list: StorageListType,
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

const readCollectionItems = async (
    collectionName: PlaceCollectionType,
): Promise<Item[]> => {
    const snapshot = await firestore.collection(collectionName).get();
    return snapshot.docs.map((doc) => {
        const data = doc.data() as Partial<Item>;
        return {
            ...data,
            id: typeof data.id === "string" && data.id.trim().length > 0 ? data.id : doc.id,
            aControles: Array.isArray(data.aControles) ? data.aControles : [],
        } as Item;
    });
};

const syncCollectionToStorageFile = async (
    collectionName: PlaceCollectionType,
): Promise<DataFile> => {
    const listType = COLLECTION_TO_LIST_TYPE[collectionName];
    const items = await readCollectionItems(collectionName);
    const dataFile: DataFile = {
        status: 200,
        data: items,
        updated: new Date().toISOString(),
        count: items.length,
    };

    const ok = await updateFile(listType, dataFile);
    if (!ok) {
        throw new Error(`Failed to update storage file for collection '${collectionName}'.`);
    }

    console.log(
        `Synced Firestore collection '${collectionName}' to digesa-${listType}.json with ${items.length} records.`,
    );
    return dataFile;
};

const syncPlacesCollectionsData = async (): Promise<void> => {
    const placeCollections: PlaceCollectionType[] = [
        "hotels",
        "restaurants",
        "tourisms",
    ];

    for (const collectionName of placeCollections) {
        await syncCollectionToStorageFile(collectionName);
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

export const createPlaceItem = onRequest(
    { timeoutSeconds: FUNCTION_TIMEOUT_SECONDS },
    async (request, response) => {
        setCorsHeaders(response);

        if (request.method === "OPTIONS") {
            response.status(204).send("");
            return;
        }

        if (request.method !== "POST") {
            response.status(405).json({
                ok: false,
                error: "Method not allowed. Use POST.",
            });
            return;
        }

        try {
            const body = (request.body ?? {}) as Record<string, unknown>;
            const type = parsePlaceCollectionType(body.type);
            const itemPayload =
                body.item && typeof body.item === "object"
                    ? body.item
                    : body;
            const item = parseItem(itemPayload);

            const providedId =
                typeof item.id === "string" && item.id.trim().length > 0
                    ? item.id.trim()
                    : undefined;
            const finalId = providedId ?? firestore.collection(type).doc().id;

            // Handle optional base64 photo upload
            if (typeof body.photoBase64 === "string" && body.photoBase64.startsWith("data:")) {
                const base64Data = body.photoBase64;
                const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
                if (matches && matches.length === 3) {
                    const contentType = matches[1];
                    const buffer = Buffer.from(matches[2], "base64");
                    
                    const now = new Date();
                    const year = String(now.getFullYear());
                    const month = String(now.getMonth() + 1).padStart(2, "0");
                    const originalName = typeof body.photoName === "string" ? body.photoName : "photo.jpg";
                    const cleanName = originalName
                        .toLowerCase()
                        .replace(/[^a-z0-9._-]+/g, "-")
                        .replace(/^-+|-+$/g, "")
                        .slice(0, 80);
                    
                    const path = `places/${type}/${year}/${month}/${finalId}-${cleanName}`;
                    const bucket = getStorage().bucket();
                    const file = bucket.file(path);
                    
                    await file.save(buffer, {
                        contentType: contentType,
                        public: true,
                    });
                    
                    await file.makePublic();
                    item.urlFoto = file.publicUrl();
                } else {
                    throw new Error("Invalid base64 photo format.");
                }
            }

            const docRef = firestore.collection(type).doc(finalId);
            await docRef.set({
                ...item,
                id: finalId,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });

            response.status(201).json({
                ok: true,
                id: finalId,
                type,
                docPath: `${type}/${finalId}`,
                urlFoto: item.urlFoto,
            });
        } catch (error) {
            console.error("Failed to create place item:", error);
            const message =
                error instanceof Error
                    ? error.message
                    : "Unknown error while creating place item.";
            response.status(400).json({ ok: false, error: message });
        }
    },
);

// Every day at 4:20 PM (America/Lima)
export const syncPlacesDataFromFirestore = onSchedule(
    {
        schedule: "20 16 * * *",
        timeZone: "America/Lima",
        timeoutSeconds: FUNCTION_TIMEOUT_SECONDS,
    },
    async () => {
        await syncPlacesCollectionsData();
    },
);

export const refreshPlacesDataFromFirestore = onRequest(
    { timeoutSeconds: FUNCTION_TIMEOUT_SECONDS },
    async (_request, response) => {
        await syncPlacesCollectionsData();
        response.send("Places data sync from Firestore completed.");
    },
);
