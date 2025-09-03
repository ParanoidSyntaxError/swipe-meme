"use server";

import { getCurrentPumpfunMetas, getForYouPumpfunTokens } from "./pumpfun";
import OpenAI from "openai";

export type TokenIdea = {
    name: string;
    symbol: string;
    description: string;
    imageUrl?: string;
};

type TokenIdeasCache = {
    timestamp: number;
    ideas: TokenIdea[];
};

const placeholderIdeas: TokenIdea[] = [
    {
        name: "Catwifgyatt",
        symbol: "GYATT",
        description: "Its a cat wif a gyatt",
        imageUrl: `https://picsum.photos/400?random=${Math.random()}`
    },
    {
        name: "Racist fish",
        symbol: "RFISH",
        description: "A racist fish that hates minorities",
        imageUrl: `https://picsum.photos/400?random=${Math.random()}`
    },
    {
        name: "FSH",
        symbol: "FSH",
        description: "You already know what dev is gonna do",
        imageUrl: `https://picsum.photos/400?random=${Math.random()}`
    },
    {
        name: "Ser",
        symbol: "SER",
        description: "Ser, do the needful, my village is hungry",
        imageUrl: `https://picsum.photos/400?random=${Math.random()}`
    },
    {
        name: "N Word Pass",
        symbol: "NWORD",
        description: "An onchain pass to say THE word",
        imageUrl: `https://picsum.photos/400?random=${Math.random()}`
    },
];

const openAiClient = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const ideasCache = new Map<string, TokenIdeasCache>();
const ideasCacheTtl = 1000 * 60; // 1 minute

export async function getTokenIdeas(): Promise<TokenIdea[]> {
    try {
        const cachedIdeas = ideasCache.get("IDEAS");
        if(cachedIdeas && cachedIdeas.timestamp > Date.now() - ideasCacheTtl) {
            return cachedIdeas.ideas;
        }

        const [forYouTokens,pumpfunMetas] = await Promise.all([
            getForYouPumpfunTokens(), 
            getCurrentPumpfunMetas()
        ]);
        if(!pumpfunMetas || !forYouTokens) {
            return placeholderIdeas;
        }

        const response = await openAiClient.responses.create({
            model: "gpt-5-nano",
            reasoning: { effort: "medium" },
            instructions: "Generate unique meme coins based on a list of current pumpfuns most popular meme coin themes, and recently deployed pumpfun meme coins. Do not generate the same meme coin twice. Do not use the same name or symbol for multiple meme coins. Randomize the outputed meme coins order, do not output the meme coins in the same order as the inputs. The meme coins should either be based on a single word from the list of pumpfun themes, or be based on a recently deployed pumpfun meme coin, or be a combination of both. The meme coins should stay within the format and style of pumpfun meme coins. Your output should be a JSON array of objects with the following properties: name, symbol and description. The name should be a short name for the meme coin and not end with the word 'token' or 'coin'. The symbol should be limited to at most 6 characters, but as short as possible. The description should be a short description of the meme coin.",
            input: `Generate twenty five unique meme coins based on the following pumpfun themes: ${pumpfunMetas.map(meta => meta.word).join(", ")}. And the following most recent pumpfun meme coins: ${forYouTokens.map(token => JSON.stringify(token)).join(", ")}.`,
        });
        if(response.error) {
            console.error("Error generating token ideas:", response.error);
            return placeholderIdeas;
        }

        const ideas = JSON.parse(response.output_text);
        ideasCache.set("IDEAS", {
            timestamp: Date.now(),
            ideas,
        });
        return ideas;
    } catch (error) {
        console.error("Error getting token ideas:", error);
        return placeholderIdeas;
    }        
}