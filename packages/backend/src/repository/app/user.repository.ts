import { userTable } from "common/db/schema";
import { db } from "../../db/db";
import { eq } from "drizzle-orm";

export const isUserInvited = async (pubkey:string) => {
    const res = await db.select().from(userTable).where(eq(userTable.pubkey, pubkey))
    return res.length?true:false
}