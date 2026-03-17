import { userTable } from "common/db/schema";
import { db } from "../../db/db";
import { and, eq, isNull, or, gt } from "drizzle-orm";
import { getUnixNow } from "common/util";

export const isUserInvited = async (pubkey:string) => {
    const res = await db.select().from(userTable).where(eq(userTable.pubkey, pubkey))
    return res.length?true:false
}

export const registerUser = async (pubkey:string, inviteCode: string) => {
    const res = await db.update(userTable).set({pubkey,
        userCreatedAt: getUnixNow(),
        isActive: true
    }).where(and(eq(userTable.inviteCode, inviteCode), isNull(userTable.pubkey))).returning()
    return res.length?true:false
}

export const verifyInviteCode = async (inviteCode: string) => {
    const now = getUnixNow();
    const res = await db.select().from(userTable).where(
        and(
            eq(userTable.inviteCode, inviteCode),
            isNull(userTable.userCreatedAt), // not used yet
            or(
                isNull(userTable.codeExpiresAt), // no expiry
                gt(userTable.codeExpiresAt, now) // or not expired
            )
        )
    );
    return res.length > 0;
}
