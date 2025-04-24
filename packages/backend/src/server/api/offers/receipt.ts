import { db } from "@openPleb/common/db";
import {
	type InsertReceipt,
	claimsTable,
	offerTable,
	receiptsTable,
} from "@openPleb/common/db/schema";
import { OFFER_STATE } from "@openPleb/common/types";
import { eq } from "drizzle-orm";
import { eventEmitter } from "../../../events/emitter";

export async function createReceipt(
	offerId: string,
	pubkey: string,
	receiptImg: string,
) {
	const id = Number.parseInt(offerId);

	if (Number.isNaN(id)) {
		return new Response("Invalid offer ID", { status: 400 });
	}

	const claims = await db
		.select()
		.from(claimsTable)
		.where(eq(claimsTable.offerId, id))
		.limit(1);

	if (claims.length === 0) {
		return new Response("No claims found for this offer", { status: 404 });
	}

	if (claims[0].pubkey !== pubkey) {
		return new Response("Unauthorized pubkey", { status: 401 });
	}

	const receipt: InsertReceipt = {
		pubkey,
		offerId: id,
		receiptImg,
		createdAt: Math.ceil(Date.now() / 1000),
	};

	const result = await db.insert(receiptsTable).values(receipt).returning();

	const offerResponse = await db
		.update(offerTable)
		.set({ status: OFFER_STATE.RECEIPT_SUBMITTED, validForS: 500 })
		.where(eq(offerTable.id, id))
		.returning();
	eventEmitter.emit("socket-event", {
		command: "update-offer",
		data: { offer: offerResponse[0] },
	});
	eventEmitter.emit("socket-event", {
		command: "new-receipt",
		data: { receipt: result[0] },
		pubkeys: [receipt.pubkey, offerResponse[0].pubkey],
	});

	return { receipt: result[0] };
}

export async function getReceipt(offerId: string) {
	const id = Number.parseInt(offerId);
	if (Number.isNaN(id)) {
		return new Response("Invalid offer ID", { status: 400 });
	}

	const result = await db
		.select()
		.from(receiptsTable)
		.where(eq(receiptsTable.offerId, id));

	return { receipt: result[0] };
}
