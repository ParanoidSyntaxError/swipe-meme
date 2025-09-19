import { promptIdeas } from "../openai/ideas";
import { queryImageUrl } from "../openverse/image";
import { Idea } from "../database/collections/ideas/types";
import { insertIdeas } from "../database/collections/ideas/collection";

export async function generateIdeas(): Promise<boolean> {
    try {
        const promptedIdeas = await promptIdeas(40);
        if (promptedIdeas === null) {
            return false;
        }

        const imageUrls: (string | null)[] = [];
        for(const promptedIdea of promptedIdeas) {
            imageUrls.push((await queryImageUrl(promptedIdea.imageQuery)));
        }

        const ideas: Idea[] = promptedIdeas.map((idea, index) => ({
            name: idea.name,
            symbol: idea.symbol,
            description: idea.description,
            imageUrl: imageUrls[index]
        }));

        const insertedPage = await insertIdeas(ideas);
        if(insertedPage === null) {
            return false;
        }

        return true;
    } catch (error) {
        console.error("Error generating ideas:", error);
        return false;
    }
}