import { ObjectId } from "mongodb";
import { log } from "../../../utils/log";
import { getCollection } from "../../client";
import { Token, TokenDocument } from "./types";

// Address -> Token
const cache = new Map<string, TokenDocument>();

export function getTokensCollection() {
    return getCollection<TokenDocument>("tokens");
}

export async function insertToken(token: Token): Promise<string | null> {
    try {
        const collection = await getTokensCollection();

        const id = new ObjectId().toHexString();
        const now = new Date();

        const doc: TokenDocument = {
            _id: id,
            createdAt: now,
            ...token
        };

        const result = await collection.insertOne(doc);
        if(!result.acknowledged && result.insertedId !== id) {
            log("error", "Inserting token failed");
            return null;
        }

        cache.set(token.address, doc);
        return id;
    } catch (error) {
        log("error", error);
        return null;
    } 
}