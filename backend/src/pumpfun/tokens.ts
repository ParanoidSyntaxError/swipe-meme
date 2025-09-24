import { log } from "../utils/log";

export type PumpfunToken = {
    name: string;
    symbol: string;
    description: string;
};

export async function getNewestPumpfunTokens(): Promise<PumpfunToken[] | null> {
    try {
        const response = await fetch(process.env.PUMPFUN_FRONTEND_API + 
            `/coins?offset=0&limit=40&sort=created_timestamp&includeNsfw=true&order=DESC`
        );
        if(!response.ok) {
            log("error", response.statusText);
            return null;
        }

        const data = await response.json();
        return data;
    } catch (error) {
        log("error", error);
        return null;
    }
}