"use server";

import { getDatabase } from "./db";
import { getCurrentPumpfunMetas, getNewestPumpfunTokens } from "./pumpfun";
import OpenAI from "openai";

export type IdeaDocument = {
    _id: string;
    name: string;
    symbol: string;
    description: string;
    imageUrl: string | null;
};

const placeholderIdeas: IdeaDocument[] = [
    {
        _id: "placeholder-0",
        name: "Catwifgyatt",
        symbol: "GYATT",
        description: "Its a cat wif a gyatt",
        imageUrl: null,
    },
    {
        _id: "placeholder-1",
        name: "Racist fish",
        symbol: "RFISH",
        description: "A racist fish that hates minorities",
        imageUrl: null,
    },
    {
        _id: "placeholder-2",
        name: "FSH",
        symbol: "FSH",
        description: "You already know what dev is gonna do",
        imageUrl: null,
    },
    {
        _id: "placeholder-3",
        name: "Ser",
        symbol: "SER",
        description: "Ser, do the needful, my village is hungry",
        imageUrl: null,
    },
    {
        _id: "placeholder-4",
        name: "N Word Pass",
        symbol: "NWORD",
        description: "An onchain pass to say THE word",
        imageUrl: null,
    },
];

const openAiClient = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const cache: IdeaDocument[] = [];
let cacheTimestamp = 0;
const cacheTtl = 1000 * 60; // 1 minute
let cacheRefreshing = false;

const pageLength = 40;

export async function getIdeasCollection() {
    const db = await getDatabase();
    return db.collection<IdeaDocument>("ideas");
}

export async function getIdeas(page: number): Promise<IdeaDocument[]> {
    try {



        /*
        const cachedIdeas = ideasCache.get(ideasCacheKey);
        if(!cachedIdeas) {
            if(!ideasCacheRefreshing) {
                ideasCacheRefreshing = true;
                refreshIdeasCache(ideasCacheKey).finally(() => ideasCacheRefreshing = false);
            }
            return placeholderIdeas;
        } else {
            if(cachedIdeas.timestamp < Date.now() - ideasCacheTtl) {
                refreshIdeasCache(ideasCacheKey);
            }
            return cachedIdeas.ideas;
        }
        */
    } catch (error) {
        console.error("Error getting token ideas:", error);
        return placeholderIdeas;
    }
}

/*
async function refreshIdeasCache(key: string) {
    try {
        const [newestTokens, pumpfunMetas] = await Promise.all([
            getNewestPumpfunTokens(),
            getCurrentPumpfunMetas()
        ]);
        if (!pumpfunMetas || !newestTokens) {
            return;
        }

        const response = await openAiClient.responses.create({
            model: "gpt-5-mini",
            reasoning: { effort: "low" },
            instructions: "Generate unique meme coins based on a list of recently deployed pumpfun meme coins. The meme coins should stay within the format and style of pumpfun meme coins. Your output should be a JSON array of objects with the following properties: name, symbol and description. The symbol should be limited to at most 6 characters, but as short as possible. The description should be a short description of the meme coin.",
            input: `Generate fourty unique meme coins based on the following newest pumpfun meme coins: ${newestTokens.map(token => JSON.stringify(token)).join(", ")}.`,
        });
        if (response.error) {
            console.error("Error generating token ideas:", response.error);
            return;
        }

        const ideas = JSON.parse(response.output_text);
        ideasCache.set(key, {
            timestamp: Date.now(),
            ideas,
        });
    } catch (error) {
        console.error("Error refreshing ideas cache:", error);
    }
}
*/
