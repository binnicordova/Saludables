import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Item } from "./models/Item";

const API_BASE_URL = process.env.STORAGE_API_URL;
const CACHE_KEY_PREFIX = "dataService_cache_list_";
const CACHE_EXPIRATION_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

const CacheManager = {
    getCache: async (
        key: string,
    ): Promise<{ data: string | null; isValid: boolean }> => {
        const cachedData = await AsyncStorage.getItem(key);
        const cachedTimestamp = await AsyncStorage.getItem(`${key}_timestamp`);

        if (cachedData && cachedTimestamp) {
            const now = Date.now();
            const timestamp = Number.parseInt(cachedTimestamp, 10);
            const isValid = now - timestamp < CACHE_EXPIRATION_MS;
            return { data: cachedData, isValid };
        }

        return { data: null, isValid: false };
    },

    setCache: async (key: string, data: string): Promise<void> => {
        await AsyncStorage.setItem(key, data);
        await AsyncStorage.setItem(`${key}_timestamp`, Date.now().toString());
    },
};

const ApiService = {
    fetchData: async (list: "pool" | "beach"): Promise<Item[]> => {
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

const dataService = {
    list: async (list: "pool" | "beach" = "pool"): Promise<Item[]> => {
        const cacheKey = `${CACHE_KEY_PREFIX}${list}`;

        try {
            // Retrieve cached data
            const { data: cachedData, isValid } =
                await CacheManager.getCache(cacheKey);
            if (cachedData && isValid) {
                console.log("Returning cached data for list:", list);
                return JSON.parse(cachedData) as Item[];
            }

            // Fetch data from API if cache is invalid or missing
            const data = await ApiService.fetchData(list);

            // Cache the fetched data only if it's non-empty
            if (data && data.length > 5) {
                await CacheManager.setCache(cacheKey, JSON.stringify(data));
                console.log("Data cached for list:", list);
            } else {
                console.log("Received empty data, not caching for list:", list);
            }

            console.log("Returning fresh data for list:", list, "items count:", data.length);
            return data;
        } catch (error) {
            console.error("Error fetching list:", error);
            throw error;
        }
    },
};

export default dataService;
