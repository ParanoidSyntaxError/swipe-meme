import { Filter, ObjectId } from "mongodb";
import { getCollection } from "../../client";
import { SortDirection } from "../types";
import { Idea, IdeaDocument } from "./types";
import { log } from "../../../utils/log";

// Page -> Ideas
const cache = new Map<number, IdeaDocument[]>();

export function getIdeasCollection() {
    return getCollection<IdeaDocument>("ideas");
}

export async function getNewestPage(excludedPages?: number[]): Promise<number | null> {
    try {
        const collection = await getIdeasCollection();

        const query: Filter<IdeaDocument> = {};
        if(excludedPages && excludedPages.length > 0) {
            query.page = { $nin: excludedPages };
        }

        const newestPage = await collection
            .find(query, { projection: { _id: 0, page: 1 } })
            .sort({ page: SortDirection.Descending })
            .limit(1)
            .next();
        if (!newestPage) {
            return null;
        }

        return newestPage.page;
    } catch (error) {
        log("error", error);
        return null;
    }
}

export async function getIdeasByPage(page: number): Promise<IdeaDocument[] | null> {
    try {
        const collection = await getIdeasCollection();

        if(cache.has(page)) {
            return cache.get(page)!;
        }

        const ideas = await collection.find({ page: page }).toArray();
        cache.set(page, ideas);

        return ideas;
    } catch (error) {
        log("error", error);
        return null;
    }
}

export async function getNewestIdeas(excludedPages?: number[], limit: number = 10): Promise<IdeaDocument[] | null> {
    try {
        const collection = await getIdeasCollection();

        const newestPage = await getNewestPage(excludedPages);
        if (newestPage === null) {
            return null;
        }

        if(cache.has(newestPage)) {
            return cache.get(newestPage)!.slice(0, limit);
        }

        const ideas = await collection
            .find({ page: newestPage })
            .toArray();
        cache.set(newestPage, ideas);

        return ideas.slice(0, limit);
    } catch (error) {
        log("error", error);
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
            _id: new ObjectId().toHexString(),
            createdAt: now,
            name: idea.name,
            symbol: idea.symbol,
            description: idea.description,
            imageUrl: idea.imageUrl,
            page: nextPage
        }));

        const result = await collection.insertMany(docs);
        if(!result.acknowledged || result.insertedCount === 0) {
            log("error", "Inserting ideas failed");
            return null;
        }

        if(result.insertedCount !== ideas.length) {
            log("error", `Failed to insert all ideas: Attempted: ${ideas.length}, Inserted: ${result.insertedCount}`);
        }

        cache.set(nextPage, docs);
        
        return nextPage;
    } catch (error) {
        log("error", error);
        return null;
    }
}