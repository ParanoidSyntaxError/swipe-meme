import { Collection, MongoClient, Document } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI);
const database = client.db(process.env.MONGODB_DB_NAME);

const collections = new Map<string, Collection<any>>();

export async function getCollection<T extends Document>(name: string): Promise<Collection<T>> {
    if (!collections.has(name)) {
        collections.set(name, database.collection<T>(name));
    }
    return collections.get(name)!;
}