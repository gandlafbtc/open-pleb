import { proofsTable } from "@openPleb/common/db/schema";
import { wallet } from "../cashu/wallet";
import { db } from "../db/db";
import { eq } from "drizzle-orm";
import { InternalProofState } from "../types";
import { CheckStateEnum, type ProofState } from "@cashu/cashu-ts";

export const checkPendingProofs = async () => {
    const pendingProofsInternal = await db.select().from(proofsTable).where(eq(proofsTable.state, CheckStateEnum.PENDING)).limit(50)

    const pendingPfoofs = pendingProofsInternal.map((proof) => {
        return {
            id: proof.id,
            secret: proof.secret,
            C: proof.C,
            amount: proof.amount
        }
    })

    const proofStates: ProofState[] = await wallet.checkProofsStates(pendingPfoofs)

    //... continue here ...
};