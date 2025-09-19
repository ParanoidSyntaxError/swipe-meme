import { ObjectId } from "mongodb";
import { getCollection } from "../../client";
import { SortDirection } from "../types";
import { Idea, IdeaDocument } from "./types";

// Page -> Ideas
const cache = new Map<number, IdeaDocument[]>();

export function getIdeasCollection() {
    return getCollection<IdeaDocument>("ideas");
}

export async function getNewestPage(): Promise<number | null> {
    try {
        const collection = await getIdeasCollection();

        const newestPage = await collection
            .find({}, { projection: { _id: 0, page: 1 } })
            .sort({ page: SortDirection.Descending })
            .limit(1)
            .next();
        if (!newestPage) {
            console.error("Could not find newest page");
            return null;
        }

        return newestPage.page;
    } catch (error) {
        console.error("Error getting newest page:", error);
        return null;
    }
}

export async function getIdeas(page: number): Promise<IdeaDocument[] | null> {
    try {
        const collection = await getIdeasCollection();

        if(cache.has(page)) {
            return cache.get(page)!;
        }

        const ideas = await collection.find({ page: page }).toArray();
        cache.set(page, ideas);

        return ideas;
    } catch (error) {
        console.error("Error getting ideas:", error);
        return null;
    }
}

export async function getNewestIdeas(): Promise<IdeaDocument[] | null> {
    try {
        const collection = await getIdeasCollection();

        const newestPage = await getNewestPage();
        if (newestPage === null) {
            return null;
        }

        if(cache.has(newestPage)) {
            return cache.get(newestPage)!;
        }

        const ideas = await collection.find({ page: newestPage }).toArray();
        cache.set(newestPage, ideas);

        return ideas;
    } catch (error) {
        console.error("Error getting newest ideas:", error);
        return null;
    }
}

export async function insertIdeas(ideas: Idea[]): Promise<number | null> {
    try {
        const collection = await getIdeasCollection();

        const newestPage = await getNewestPage();
        if (newestPage === null) {
            return null;
        }
        const nextPage = newestPage + 1;

        const now = new Date();

        const docs: IdeaDocument[] = ideas.map(idea => ({
            _id: new ObjectId(),
            createdAt: now,
            name: idea.name,
            symbol: idea.symbol,
            description: idea.description,
            imageUrl: idea.imageUrl,
            page: nextPage
        }));

        const result = await collection.insertMany(docs);
        if(!result.acknowledged || result.insertedCount === 0) {
            console.error("Inserting ideas failed");
            return null;
        }

        if(result.insertedCount !== ideas.length) {
            console.error("Failed to insert all ideas:" + `Attempted: ${ideas.length}, Inserted: ${result.insertedCount}`);
        }

        cache.set(nextPage, docs);
        
        return nextPage;
    } catch (error) {
        console.error("Error inserting ideas:", error);
        return null;
    }
}