import { InsertUser, userTable } from "common/db/schema";
import { db } from "../../db/db";
import { desc, lt, isNotNull, isNull, count } from "drizzle-orm";

export const insertCodes = async (codes: InsertUser[]) => {
    const insertedCodes = await db.insert(userTable).values(codes).returning()
    return insertedCodes
}

export const getRecentUsers = async (limit: number = 100, beforeCreatedAt?: number) => {
    const query = db
        .select()
        .from(userTable)
        .orderBy(desc(userTable.codeCreatedAt))
        .limit(limit);
    
    if (beforeCreatedAt) {
        const users = await query.where(lt(userTable.codeCreatedAt, beforeCreatedAt));
        return users;
    }
    
    const users = await query;
    return users;
}

export const getUsedCount = async () => {
    const result = await db
        .select({ count: count() })
        .from(userTable)
        .where(isNotNull(userTable.pubkey));
    
    return result[0]?.count ?? 0;
}

export const getUnusedCount = async () => {
    const result = await db
        .select({ count: count() })
        .from(userTable)
        .where(isNull(userTable.pubkey));
    
    return result[0]?.count ?? 0;
}
