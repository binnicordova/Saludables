import type { Item } from "./Item";

const API_BASE_URL = "https://veranosaludable.minsa.gob.pe/VF/ws2.php?";

export const digesaService = {
    list: async (list: "pool" | "beach" = "pool"): Promise<Item[]> => {
        try {
            const strSource = list === "pool" ? "pi" : "pl";
            console.log(`Fetching list of type '${list}' from DIGESA service.`);
            const response = await fetch(API_BASE_URL, {
                method: "POST",
                headers: {
                    accept: "application/json, text/javascript, */*; q=0.01",
                    "content-type":
                        "application/x-www-form-urlencoded; charset=UTF-8",
                    "x-requested-with": "XMLHttpRequest",
                },
                body: `rt=exa&cmd=getList&strSource=${strSource}&idDpto=&idProv=&idDist=&strCalidadSanitaria=&strSearch=`,
            });
            if (response.status !== 200) {
                throw new Error("Network response was not ok");
            }
            const data = await response.json();
            if (!data.aRows) {
                throw new Error("Invalid response format");
            }
            const items = data.aRows as Item[];
            console.log(
                `Fetched ${items.length} items for list type '${list}'`,
            );
            return items;
        } catch (error) {
            console.error("Error fetching list:", error);
            throw error;
        }
    },
    item: async (
        id: string,
        list: "pool" | "beach" = "pool",
    ): Promise<Item> => {
        try {
            const strSource = list === "pool" ? "pi" : "pl";
            console.log(
                `Fetching item with id '${id}' from list type '${list}'`,
            );
            const response = await fetch(API_BASE_URL, {
                method: "POST",
                headers: {
                    accept: "application/json, text/javascript, */*; q=0.01",
                    "accept-language": "en,es-PE;q=0.9,es;q=0.8,und;q=0.7",
                    "content-type":
                        "application/x-www-form-urlencoded; charset=UTF-8",
                    origin: "https://veranosaludable.minsa.gob.pe",
                    priority: "u=1, i",
                    referer: "https://veranosaludable.minsa.gob.pe/",
                    "sec-ch-ua":
                        '"Google Chrome";v="141", "Not?A_Brand";v="8", "Chromium";v="141"',
                    "sec-ch-ua-mobile": "?0",
                    "sec-ch-ua-platform": '"macOS"',
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "same-origin",
                    "user-agent":
                        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
                    "x-requested-with": "XMLHttpRequest",
                },
                body: `rt=exa&cmd=getDetail&strSource=${strSource}&id=${id}`,
            });
            if (response.status !== 200) {
                throw new Error("Network response was not ok");
            }
            const data = await response.json();
            if (!data.aRow) {
                throw new Error("Invalid response format");
            }

            const item = data.aRow as Item;
            return item;
        } catch (error) {
            console.error(`Error fetching item with id ${id}:`, error);
            throw error;
        }
    },
};
