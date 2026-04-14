import { db } from "../../db/db";
import { fiatProviderTable, type FiatProvider } from "common/db/schema";
import { eq } from "drizzle-orm";

export const providerRepository = {
	async getAll(): Promise<FiatProvider[]> {
		return await db.select().from(fiatProviderTable);
	},

	async getById(id: number): Promise<FiatProvider | undefined> {
		const result = await db.select().from(fiatProviderTable).where(eq(fiatProviderTable.id, id));
		return result[0];
	},

};
