import * as schema from "@openPleb/common/db";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { log } from "../logger";

if (!process.env.DATABASE_URL) { 
	log.error("DATABASE_URL environment variable is not set");
	process.exit(1);
}

const client = postgres(process.env.DATABASE_URL); // will use psql environment variables
export const db = drizzle({ client, schema }); //
