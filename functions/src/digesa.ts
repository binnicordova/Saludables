import type { Item } from "./Item";

const API_BASE_URL = "https://veranosaludable.minsa.gob.pe/VF/ws2.php?";
const REQUEST_TIMEOUT_MS = 20_000;

const createTimeoutController = () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    return { controller, timeoutId };
};

export const digesaService = {
    list: async (list: "pool" | "beach" = "pool"): Promise<Item[]> => {
        const { controller, timeoutId } = createTimeoutController();
        try {
            const strSource = list === "pool" ? "pi" : "pl";
            console.log(`Fetching list of type '${list}' from DIGESA service.`);

            const payload = {
                method: "POST",
                signal: controller.signal,
                headers: {
                    accept: "application/json, text/javascript, */*; q=0.01",
                    "content-type":
                        "application/x-www-form-urlencoded; charset=UTF-8",
                    "x-requested-with": "XMLHttpRequest",
                },
                body: `rt=exa&cmd=getList&strSource=${strSource}&idDpto=&idProv=&idDist=&strCalidadSanitaria=&strSearch=`,
            };

            console.log("CURL command for debugging:\n", `curl -X POST '${API_BASE_URL}' \\
  -H 'accept: application/json, text/javascript, */*; q=0.01' \\
  -H 'content-type: application/x-www-form-urlencoded; charset=UTF-8' \\
  -H 'x-requested-with: XMLHttpRequest' \\
  --data-raw 'rt=exa&cmd=getList&strSource=${strSource}&idDpto=&idProv=&idDist=&strCalidadSanitaria=&strSearch='`);

            const response = await fetch(API_BASE_URL, payload);
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
        } finally {
            clearTimeout(timeoutId);
        }
    },
    item: async (
        id: string,
        list: "pool" | "beach" = "pool",
    ): Promise<Item> => {
        const { controller, timeoutId } = createTimeoutController();
        try {
            const strSource = list === "pool" ? "pi" : "pl";
            console.log(
                `Fetching item with id '${id}' from list type '${list}'`,
            );
            const payload = {
                method: "POST",
                signal: controller.signal,
                headers: {
                    accept: "application/json, text/javascript, */*; q=0.01",
                    "content-type":
                        "application/x-www-form-urlencoded; charset=UTF-8",
                    "x-requested-with": "XMLHttpRequest",
                },
                body: `rt=exa&cmd=getDetail&strSource=${strSource}&id=${id}`,
            };

            const response = await fetch(API_BASE_URL, payload);
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
        } finally {
            clearTimeout(timeoutId);
        }
    },
};
