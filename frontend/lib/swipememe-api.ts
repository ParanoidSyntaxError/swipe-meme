import { IdeaDocument, NewestIdeasResponse, TokenBalanceResponse } from "@swipememe-api/types";
import { NATIVE_SOL_ADDRESS } from "@swipememe-api/constants";

export async function getNewestIdeas(): Promise<IdeaDocument[] | null> {
    const response = await fetch(process.env.NEXT_PUBLIC_SWIPEMEME_API + 
        `/ideas/newest`
    );
    if(!response.ok) {
        console.error("Error getting newest ideas:", response.statusText);
        return null;
    }
    
    const data = await response.json() as NewestIdeasResponse;
    return data.ideas;
}

export async function getLamportBalance(address: string): Promise<number | null> {
    try {
        const response = await fetch(process.env.NEXT_PUBLIC_SWIPEMEME_API + 
            `/token/balance?token=${NATIVE_SOL_ADDRESS}&owner=${address}`
        );
        if(!response.ok) {
            console.error("Error getting lamport balance:", response.statusText);
            return null;
        }
        
        const data = await response.json() as TokenBalanceResponse;
        return data.amount;
    } catch (error) {
        console.error("Error getting lamport balance:", error);
        return null;
    }
}

export async function getTokenBalance(token: string, address: string): Promise<number | null> {
    try {
        const response = await fetch(process.env.NEXT_PUBLIC_SWIPEMEME_API + 
            `/token/balance?token=${token}&owner=${address}`
        );
        if(!response.ok) {
            console.error("Error getting token balance:", response.statusText);
            return null;
        }
        
        const data = await response.json() as TokenBalanceResponse;
        return data.amount;
    } catch (error) {
        console.error("Error getting token balance:", error);
        return null;
    }
}