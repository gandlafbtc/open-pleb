import { db } from "../db/db";
import { migrate } from "drizzle-orm/postgres-js/migrator";

/**
 * Migration repository - handles database migrations
 */
export class MigrationRepository {
	static async runMigrations(migrationsFolder: string) {
		await migrate(db, { migrationsFolder });
	}
}
