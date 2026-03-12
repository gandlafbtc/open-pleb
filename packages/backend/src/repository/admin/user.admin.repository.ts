import { InsertUser, userTable } from "common/db/schema";
import { db } from "../../db/db";

export const insertCodes = async (codes: InsertUser[]) => {
    const insertedCodes = await db.insert(userTable).values(codes).returning()
    return insertedCodes
}  