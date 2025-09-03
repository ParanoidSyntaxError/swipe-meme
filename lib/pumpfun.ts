export type PumpfunToken = {
    name: string;
    symbol: string;
    description: string;
};

export type PumpfunMeta = {
    word: string;
    score: number;
};

export async function getForYouPumpfunTokens(): Promise<PumpfunToken[] | null> {
    try {
        const response = await fetch(`${process.env.PUMPFUN_FRONTEND_API}/coins/for-you?offset=0&limit=10&includeNsfw=true`);
        if(!response.ok) {
            console.error("Error fetching for you pumpfun tokens:", response.statusText);
            return null;
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error getting for you pumpfun tokens:", error);
        return null;
    }
}

export async function getCurrentPumpfunMetas(): Promise<PumpfunMeta[] | null> {
    try {
        const response = await fetch(`${process.env.PUMPFUN_FRONTEND_API}/metas/current`);
        if(!response.ok) {
            console.error("Error fetching pumpfun metas:", response.statusText);
            return null;
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error getting pumpfun metas:", error);
        return null;
    }
}