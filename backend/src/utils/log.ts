import { randomBytes } from "crypto";

export function newLogId(): string {
    return randomBytes(16).toString("hex").substring(0, 4);
}

function callerName(): string {
    const stack = new Error().stack;
    return stack?.split('\n')[3]?.match(/at\s+(\w+)/)?.[1] || 'unknown';
}

export function log(type: "info" | "success" | "error", message: any, id?: string) {
    const caller = callerName();

    let msg = `(${caller})`;
    if(id) {
        msg = `${msg} (${id}) : ${message}`;
    } else {
        msg = `${msg} : ${message}`;
    }

    if(type === "info") {
        console.log(`[INFO] ${msg}`);
    } else if(type === "success") {
        console.log(`[SUCCESS] ${msg}`);
    } else if(type === "error") {
        console.error(`[ERROR] ${msg}`);
    }
}