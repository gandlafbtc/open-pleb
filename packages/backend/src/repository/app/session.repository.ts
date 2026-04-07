import { sessionTable, type InsertSession } from "common/db/schema";
import { db } from "../../db/db";
import { eq, lt } from "drizzle-orm";
import { getUnixNow } from "common/util";

/**
 * Create a new blind session
 */
export const createSession = async (sessionData: InsertSession) => {
	const result = await db.insert(sessionTable).values(sessionData).returning();
	return result[0];
};

/**
 * Get session by BAT token
 */
export const getSessionByBat = async (bat: string) => {
	const result = await db.select().from(sessionTable).where(eq(sessionTable.bat, bat));
	return result[0];
};

/**
 * Get session by ID
 */
export const getSessionById = async (sessionId: string) => {
	const result = await db.select().from(sessionTable).where(eq(sessionTable.id, sessionId));
	return result[0];
};

/**
 * Delete expired sessions
 */
export const deleteExpiredSessions = async () => {
	const now = getUnixNow();
	await db.delete(sessionTable).where(lt(sessionTable.expiresAt, now));
};

/**
 * Check if session is valid (exists and not expired)
 */
export const isSessionValid = async (sessionId: string): Promise<boolean> => {
	const session = await getSessionById(sessionId);
	if (!session) return false;
	
	const now = getUnixNow();
	return session.expiresAt ? session.expiresAt > now : true;
};
