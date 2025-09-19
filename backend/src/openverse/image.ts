import { getAuthToken } from "./auth";

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
            console.error("Error getting openverse image:", response.statusText);
            return null;
        }

        const data = await response.json();
        const images: any[] = data.results;
        
        const randomImage = images[Math.floor(Math.random() * images.length)];
        return randomImage.url;
    } catch (error) {
        console.error("Error getting openverse image:", error);
        return null;
    }
}