import { getAuthToken } from "./auth";
import { log } from "../utils/log";

export async function queryImageUrl(query: string): Promise<string | null> {
    try {
        const authToken = await getAuthToken();
        if(!authToken) {
            return null;
        }

        const url = new URL(`${process.env.OPENVERSE_API}/images`);
        url.searchParams.set("q", query);
        url.searchParams.set("page_size", "5");

        const response = await fetch(url, {
            headers: {
                "Authorization": `Bearer ${authToken}`
            }
        });
        if(!response.ok) {
            log("error", response.statusText);
            return null;
        }

        const data = await response.json();
        const images: any[] = data.results;
        if(images.length === 0) {
            return null;
        }

        const randomImage = images[Math.floor(Math.random() * images.length)];
        return randomImage?.url ?? null;
    } catch (error) {
        log("error", error);
        return null;
    }
}