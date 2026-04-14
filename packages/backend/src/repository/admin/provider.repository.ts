import { db } from "../../db/db";
import { fiatProviderTable, type FiatProvider, type InsertFiatProvider } from "common/db/schema";
import { eq } from "drizzle-orm";

export const providerAdminRepository = {

	async create(provider: Omit<InsertFiatProvider, 'id' | 'createdAt'>): Promise<FiatProvider> {
		const result = await db.insert(fiatProviderTable).values({
			...provider,
			createdAt: Math.floor(Date.now() / 1000)
		}).returning();
		return result[0];
	},

	async update(id: number, provider: Partial<Omit<InsertFiatProvider, 'id' | 'createdAt'>>): Promise<FiatProvider | undefined> {
		const result = await db.update(fiatProviderTable)
			.set(provider)
			.where(eq(fiatProviderTable.id, id))
			.returning();
		return result[0];
	},

	async delete(id: number): Promise<boolean> {
		const result = await db.delete(fiatProviderTable)
			.where(eq(fiatProviderTable.id, id))
			.returning();
		return result.length > 0;
	}
};
