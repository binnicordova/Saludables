import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Item } from "./models/Item";

const API_BASE_URL = process.env.EXPO_PUBLIC_STORAGE_API_URL;
const CACHE_KEY_PREFIX = "dataService_cache_list_";
const CACHE_EXPIRATION_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const CACHE_CHUNK_SIZE = 200 * 1024; // 200KB per chunk

export type ListType = "pool" | "beach";
export type DownloadSource = "network" | "cache-valid" | "cache-stale";

export interface ListResponseMeta {
    source: DownloadSource;
    lastUpdated: number;
    cacheAgeMs: number | null;
    usedStaleCache: boolean;
}

export interface ListResponse {
    data: Item[];
    meta: ListResponseMeta;
}

const getCacheTimestampKey = (key: string): string => `${key}_timestamp`;
const getCacheMetaKey = (key: string): string => `${key}_meta`;
const getCacheChunkKey = (key: string, index: number): string =>
    `${key}_chunk_${index}`;

const splitIntoChunks = (data: string, chunkSize: number): string[] => {
    const chunks: string[] = [];
    for (let i = 0; i < data.length; i += chunkSize) {
        chunks.push(data.slice(i, i + chunkSize));
    }
    return chunks;
};

const clearChunkedCache = async (key: string): Promise<void> => {
    const chunkPrefix = `${key}_chunk_`;
    const allKeys = await AsyncStorage.getAllKeys();
    const chunkKeys = allKeys.filter((currentKey) =>
        currentKey.startsWith(chunkPrefix),
    );
    const keysToRemove = [...chunkKeys, getCacheMetaKey(key)];
    if (keysToRemove.length > 0) {
        await AsyncStorage.multiRemove(keysToRemove);
    }
};

const CacheManager = {
    getCache: async (
        key: string,
    ): Promise<{ data: string | null; isValid: boolean; timestamp: number | null }> => {
        const cachedTimestamp = await AsyncStorage.getItem(getCacheTimestampKey(key));

        if (!cachedTimestamp) {
            return { data: null, isValid: false, timestamp: null };
        }

        const now = Date.now();
        const timestamp = Number.parseInt(cachedTimestamp, 10);
        if (Number.isNaN(timestamp)) {
            return { data: null, isValid: false, timestamp: null };
        }

        const isValid = now - timestamp < CACHE_EXPIRATION_MS;
        const cacheMeta = await AsyncStorage.getItem(getCacheMetaKey(key));

        if (cacheMeta) {
            try {
                const parsedMeta = JSON.parse(cacheMeta) as { chunks?: number };
                if (
                    typeof parsedMeta.chunks === "number" &&
                    parsedMeta.chunks > 0
                ) {
                    const chunkKeys = Array.from(
                        { length: parsedMeta.chunks },
                        (_, index) => getCacheChunkKey(key, index),
                    );
                    const chunkEntries = await AsyncStorage.multiGet(chunkKeys);
                    const hasMissingChunk = chunkEntries.some(([, value]) => !value);
                    if (!hasMissingChunk) {
                        const data = chunkEntries
                            .map(([, value]) => value as string)
                            .join("");
                        return { data, isValid, timestamp };
                    }
                }
            } catch (error) {
                console.error("Error parsing cache metadata:", error);
            }
        }

        const cachedData = await AsyncStorage.getItem(key);
        if (cachedData) {
            return { data: cachedData, isValid, timestamp };
        }

        return { data: null, isValid: false, timestamp: null };
    },

    setCache: async (key: string, data: string): Promise<void> => {
        await clearChunkedCache(key);

        if (data.length <= CACHE_CHUNK_SIZE) {
            await AsyncStorage.setItem(key, data);
        } else {
            const chunks = splitIntoChunks(data, CACHE_CHUNK_SIZE);
            const chunkPairs: [string, string][] = chunks.map((chunk, index) => [
                getCacheChunkKey(key, index),
                chunk,
            ]);

            await AsyncStorage.removeItem(key);
            await AsyncStorage.multiSet(chunkPairs);
            await AsyncStorage.setItem(
                getCacheMetaKey(key),
                JSON.stringify({ chunks: chunks.length }),
            );
        }

        await AsyncStorage.setItem(
            getCacheTimestampKey(key),
            Date.now().toString(),
        );
    },
};

const ApiService = {
    fetchData: async (list: ListType): Promise<Item[]> => {
        const uri = `${API_BASE_URL}/digesa-${list}.json`;
        console.log(
            "Fetching data from remote for list:",
            list,
            ", from URL:",
            uri,
        );

        const response = await fetch(uri);
        if (response.status !== 200) {
            console.error(
                "Failed to fetch data from API. Status:",
                response.status,
            );
            throw new Error("Network response was not ok");
        }

        const json = await response.json();
        return json.data as Item[];
    },
};

const parseCachedItems = (rawData: string | null): Item[] | null => {
    if (!rawData) return null;

    try {
        return JSON.parse(rawData) as Item[];
    } catch (error) {
        console.error("Failed to parse cached list data:", error);
        return null;
    }
};

const buildCacheAge = (timestamp: number | null): number | null => {
    if (!timestamp) return null;
    return Math.max(0, Date.now() - timestamp);
};

const dataService = {
    listWithMeta: async (list: ListType = "pool"): Promise<ListResponse> => {
        const cacheKey = `${CACHE_KEY_PREFIX}${list}`;

        try {
            // Retrieve cached data
            const { data: cachedData, isValid, timestamp } =
                await CacheManager.getCache(cacheKey);
            const parsedCachedData = parseCachedItems(cachedData);

            if (parsedCachedData && isValid) {
                console.log("Returning cached data for list:", list);
                return {
                    data: parsedCachedData,
                    meta: {
                        source: "cache-valid",
                        lastUpdated: timestamp ?? Date.now(),
                        cacheAgeMs: buildCacheAge(timestamp),
                        usedStaleCache: false,
                    },
                };
            }

            // Fetch data from API if cache is invalid or missing
            const data = await ApiService.fetchData(list);
            const fetchedAt = Date.now();

            // Cache the fetched data only if it's non-empty
            if (data && data.length > 0) {
                await CacheManager.setCache(cacheKey, JSON.stringify(data));
                console.log("Data cached for list:", list);
            } else {
                console.log("Received empty data, not caching for list:", list);
            }

            console.log(
                "Returning fresh data for list:",
                list,
                "items count:",
                data.length,
            );
            return {
                data,
                meta: {
                    source: "network",
                    lastUpdated: fetchedAt,
                    cacheAgeMs: null,
                    usedStaleCache: false,
                },
            };
        } catch (error) {
            const { data: cachedData, timestamp } = await CacheManager.getCache(cacheKey);
            const parsedCachedData = parseCachedItems(cachedData);

            if (parsedCachedData && parsedCachedData.length > 0) {
                console.warn(
                    "Falling back to stale cached data for list:",
                    list,
                );
                return {
                    data: parsedCachedData,
                    meta: {
                        source: "cache-stale",
                        lastUpdated: timestamp ?? Date.now(),
                        cacheAgeMs: buildCacheAge(timestamp),
                        usedStaleCache: true,
                    },
                };
            }

            console.error("Error fetching list:", error);
            throw error;
        }
    },

    list: async (list: ListType = "pool"): Promise<Item[]> => {
        const response = await dataService.listWithMeta(list);
        return response.data;
    },
};

export default dataService;
