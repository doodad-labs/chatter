// Import the Drizzle ORM MySQL driver for database connectivity
import { drizzle } from "drizzle-orm/mysql2";

// Load environment variables from .env file into process.env
import 'dotenv/config';

// Import the telegram and discord listener modules
import telegram from './telegram';
import discord from './discord';

// Check if the DATABASE_URL environment variable is set
// This is required to establish a database connection
if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set.");
}

// Initialize the database connection using Drizzle ORM
// drizzle() creates a database client instance with the provided connection string
const db = drizzle(process.env.DATABASE_URL);

/**
 * Main application function that initializes and runs both bots concurrently
 * This function uses Promise.allSettled to run both services without one failing affecting the other
 */
async function main() {
    // Start both Telegram and Discord bots simultaneously
    // Promise.allSettled ensures both promises settle (either resolve or reject)
    // without one rejection causing the other to be cancelled
    await Promise.allSettled([
        telegram(db),
        discord(db) 
    ]);
    
    process.exit(0); // Exit the process successfully after both bots are initialized
}

// Execute the main function and handle any uncaught errors
main().catch((error) => {
    // Log any unexpected errors that occur during application startup
    console.error("An error occurred:", error);
    
    // Exit the process with a non-zero status code to indicate failure
    process.exit(1);
});