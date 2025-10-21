import { CheckStateEnum, type ProofState } from "@cashu/cashu-ts";
import { proofsTable } from "@openPleb/common/db/schema";
import { eq } from "drizzle-orm";
import { db } from "../db/db";
import { wallet } from "../dynamic/wallet";

export const checkPendingProofs = async () => {
	const pendingProofsInternal = await db
		.select()
		.from(proofsTable)
		.where(eq(proofsTable.state, CheckStateEnum.PENDING))
		.limit(50);

	const pendingPfoofs = pendingProofsInternal.map((proof) => {
		return {
			id: proof.id,
			secret: proof.secret,
			C: proof.C,
			amount: proof.amount,
		};
	});

	const proofStates: ProofState[] =
		await wallet.checkProofsStates(pendingPfoofs);

	//... continue here ...
};
