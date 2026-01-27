import { defineConfig } from 'drizzle-kit';

export default defineConfig({
	schema: './src/db/schema.ts',
	out: '../../data/migrations',
	dialect: 'postgresql',
	dbCredentials: {
		host: 'localhost',
		port: 5432,
		user: 'postgres',
		password: 'postgres',
		database: 'postgres'
	}
});
