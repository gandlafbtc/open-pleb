import { userTable } from "common/db/schema";
import { db } from "../../db/db";
import { eq } from "drizzle-orm";
import { getUnixNow } from "common/util";

export const isUserInvited = async (pubkey:string) => {
    const res = await db.select().from(userTable).where(eq(userTable.pubkey, pubkey))
    return res.length?true:false
}

export const registerUser = async (pubkey:string, inviteCode: string) => {
    const res = await db.update(userTable).set({pubkey,
        userCreatedAt: getUnixNow(),
        isActive: true
    }).where(eq(userTable.inviteCode, inviteCode))
    return res.length?true:false
}