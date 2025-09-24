import { log } from "../utils/log";

let token: string | null = null;
let tokenTtl = 0;
let tokenTimestamp = new Date(0);

export async function getAuthToken() {
    try {
        if(token && tokenTimestamp > new Date(Date.now() - tokenTtl)) {
            return token;
        }

        const response = await fetch(`${process.env.OPENVERSE_API}/auth_tokens/token/`, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            method: "POST",
            body: new URLSearchParams({
                client_id: process.env.OPENVERSE_CLIENT_ID,
                client_secret: process.env.OPENVERSE_CLIENT_SECRET,
                grant_type: "client_credentials"
            })
        });

        if(!response.ok) {
            log("error", response.statusText);
            return null;
        }

        const data = await response.json();
        token = data.access_token;
        tokenTtl = data.expires_in / 2;
        tokenTimestamp = new Date();
        return token;
    } catch (error) {
        log("error", error);
        return null;
    }
}