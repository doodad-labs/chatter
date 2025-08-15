import { drizzle } from "drizzle-orm/mysql2";
import 'dotenv/config';

import telegram from './telegram'
import discord from './discord'

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set.");
}

const db = drizzle(process.env.DATABASE_URL);

async function main() {
    await Promise.allSettled([
        telegram(db),
        discord(db)
    ])
}

main().catch((error) => {
    console.error("An error occurred:", error);
    process.exit(1);
});