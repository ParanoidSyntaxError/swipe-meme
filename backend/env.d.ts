declare namespace NodeJS {
    interface ProcessEnv {
        NODE_ENV: "development" | "production";

        PORT: number;

        SOLANA_FEE_PAYER: string;

        SOLANA_RPC: string;
        SOLANA_RPC_WSS: string;

        PUMPFUN_FRONTEND_API: string;

        OPENAI_API_KEY: string;

        OPENVERSE_API: string;
        OPENVERSE_CLIENT_ID: string;
        OPENVERSE_CLIENT_SECRET: string;

        MONGODB_URI: string;
        MONGODB_DB_NAME: string;

        PINATA_GATEWAY_URL: string;
        PINATA_API_KEY: string;
        PINATA_API_SECRET: string;
        PINATA_JWT: string;
    }
}