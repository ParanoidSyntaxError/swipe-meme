import 'server-only';

import { MongoClient } from 'mongodb';

const URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB_NAME;

let clientPromise: Promise<MongoClient>;

// Use global cache in dev to avoid creating new clients on hot reloads
declare global {
    // eslint-disable-next-line no-var
    var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === 'development') {
    if (!global._mongoClientPromise) {
        const client = new MongoClient(URI);
        global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise!;
} else {
    // No global caching in production
    const client = new MongoClient(URI);
    clientPromise = client.connect();
}

export async function getDatabase() {
    const client = await clientPromise;
    return client.db(DB_NAME);
}