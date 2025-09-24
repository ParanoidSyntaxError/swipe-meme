import { promptIdeas } from "../openai/ideas";
import { queryImageUrl } from "../openverse/image";
import { Idea } from "../database/collections/ideas/types";
import { insertIdeas } from "../database/collections/ideas/collection";
import { newLogId, log } from "../utils/log";

let isGenerating = false;
let lastGenerationTime = new Date(0);
const generationDelay = 3000;

export async function generateIdeas(): Promise<boolean> {
    if (isGenerating || lastGenerationTime.getTime() + generationDelay > Date.now()) {
        return false;
    }
    isGenerating = true;

    const start = Date.now();
    const genId = newLogId();
    log("info", "Generating ideas...", genId);

    const result = await tryGenerateIdeas();

    if(result) {
        log("success", `Ideas generated in ${(Date.now() - start) / 1000}s`, genId);
    } else {
        log("error", `Failed to generate ideas in ${(Date.now() - start) / 1000}s`, genId);
    }

    isGenerating = false;
    lastGenerationTime = new Date();
    return result;
}

async function tryGenerateIdeas(): Promise<boolean> {
    try {
        const promptedIdeas = await promptIdeas(40);
        if (promptedIdeas === null) {
            return false;
        }

        const imageUrls: (string | null)[] = [];
        for (const promptedIdea of promptedIdeas) {
            imageUrls.push((await queryImageUrl(promptedIdea.imageQuery)));
        }

        const ideas: Idea[] = promptedIdeas.map((idea, index) => ({
            name: idea.name,
            symbol: idea.symbol,
            description: idea.description,
            imageUrl: imageUrls[index]
        }));

        const insertedPage = await insertIdeas(ideas);
        return insertedPage !== null;
    } catch (error) {
        log("error", error);
        return false;
    }
}