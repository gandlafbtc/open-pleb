import * as schema from "common/db/schema";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { log } from "../util/logger";

if (!process.env.OPENPLEB_DATABASE_URL) {
	log.error("OPENPLEB_DATABASE_URL environment variable is not set");
	process.exit(1);
}

const client = postgres(process.env.OPENPLEB_DATABASE_URL);
export const db = drizzle({ client, schema });
