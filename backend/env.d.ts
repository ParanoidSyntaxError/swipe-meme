declare namespace NodeJS {
    interface ProcessEnv {
        NODE_ENV: "development" | "production";

        PORT: number;

        SOLANA_RPC: string;

        PUMPFUN_FRONTEND_API: string;

        OPENAI_API_KEY: string;

        OPENVERSE_API: string;
        OPENVERSE_CLIENT_ID: string;
        OPENVERSE_CLIENT_SECRET: string;

        MONGODB_URI: string;
        MONGODB_DB_NAME: string;
    }
}