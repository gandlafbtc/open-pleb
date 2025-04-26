import { CheckStateEnum, type ProofState } from "@cashu/cashu-ts";
import { proofsTable } from "@openPleb/common/db/schema";
import { eq } from "drizzle-orm";
import { wallet } from "../cashu/wallet";
import { db } from "../db/db";

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
