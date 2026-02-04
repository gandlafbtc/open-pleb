#!/usr/bin/env bun
import postgres from "postgres";
import { config } from "dotenv";
import { resolve } from "path";

// Load environment variables from backend .env
config({ path: resolve(import.meta.dir, "../packages/backend/.env") });

const OPENPLEB_ENV = process.env.OPENPLEB_ENV;
const DATABASE_URL = process.env.OPENPLEB_DATABASE_URL;

// Safety check: Only allow in dev environment
if (OPENPLEB_ENV !== "dev") {
	console.error("❌ ERROR: This script can only be run in development mode!");
	console.error(`   Current OPENPLEB_ENV: ${OPENPLEB_ENV}`);
	console.error("   Set OPENPLEB_ENV=dev in packages/backend/.env to continue.");
	process.exit(1);
}

if (!DATABASE_URL) {
	console.error("❌ ERROR: OPENPLEB_DATABASE_URL not found in environment");
	process.exit(1);
}

console.log("⚠️  WARNING: This will DROP ALL TABLES in the database!");
console.log(`   Database: ${DATABASE_URL}`);
console.log(`   Environment: ${OPENPLEB_ENV}`);
console.log("");

// Prompt for confirmation
const readline = await import("readline");
const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

const answer = await new Promise<string>((resolve) => {
	rl.question("Type 'DROP' to confirm: ", resolve);
});

rl.close();

if (answer !== "DROP") {
	console.log("❌ Aborted. Database was not modified.");
	process.exit(0);
}

console.log("\n🗑️  Dropping all tables...\n");

const sql = postgres(DATABASE_URL);

try {
	// Drop all tables in the correct order (respecting foreign key constraints)
	// We can also use CASCADE to automatically drop dependent objects
	
	const tables = [
		"offers",
		"sessions",
		"subscriptions",
		"admins",
		"users",
		"fiat_providers",
		"settings",
		"vapid_keys",
	];

	for (const table of tables) {
		try {
			await sql.unsafe(`DROP TABLE IF EXISTS ${table} CASCADE`);
			console.log(`✓ Dropped table: ${table}`);
		} catch (error) {
			console.log(`⚠️  Could not drop ${table}: ${error}`);
		}
	}

	console.log("\n✅ All tables dropped successfully!");
	console.log("💡 Run migrations to recreate the schema:");
	console.log("   cd packages/common && bun run db:push");
	
} catch (error) {
	console.error("\n❌ Error dropping tables:", error);
	process.exit(1);
} finally {
	await sql.end();
}
