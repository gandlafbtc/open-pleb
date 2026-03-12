import { db } from "@openPleb/common/db";
import {
	type InsertReceipt,
	claimsTable,
	offerTable,
	receiptsTable,
} from "@openPleb/common/db/schema";
import { OFFER_STATE } from "@openPleb/common/types";
import { eq } from "drizzle-orm";
import { eventEmitter } from "../../events/emitter";

type CreateReceiptArgs ={
	pubkey :string;
	receiptImg?: string;
	skip?:boolean;
	reason?:string;
}

export async function createReceipt(
	offerId: string,
	args: CreateReceiptArgs,
) {
	const id = Number.parseInt(offerId);

	if (Number.isNaN(id)) {
		return new Response("Invalid offer ID", { status: 400 });
	}
	const {pubkey, receiptImg, skip} = args;

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

	if(!skip && !receiptImg){
		return new Response("either receipt or skip is required ", {status:400})
	}
	const now = Math.ceil(Date.now() / 1000);

	//skip mode
	if(skip){
		const [offerUpdated] = await db
		.update(offerTable)
		.set({
			status: OFFER_STATE.RECEIPT_SUBMITTED,
			validForS:500,
			paidAt:now,
			receiptSkipped: true,
		})
		.where(eq(offerTable.id, id))
		.returning();

		eventEmitter.emit("socket-event", {
			command: "update-offer",
			data: {offer: offerUpdated},
		});
		eventEmitter.emit("socket-event", {
			command: "receipt-skipped",
			data: { offerId: id, pubkeys: [claims[0].pubkey, offerUpdated.pubkey] },
			pubkeys: [claims[0].pubkey, offerUpdated.pubkey],
		});
		return {receipt:null, skipped: true};
	}
	//upload mode

	const receipt: InsertReceipt ={
		pubkey,
		offerId: id,
		receiptImg: receiptImg!,
		createdAt:now,
	};
	const [inserted] = await db.insert(receiptsTable).values(receipt).returning();

	const [offerUpdated] = await db
	.update(offerTable)
	.set({
		status: OFFER_STATE.RECEIPT_SUBMITTED,
		validForS:500,
		paidAt:now,
		receiptSkipped:false, //new colum
	})
	.where(eq(offerTable.id, id))
	.returning();

	eventEmitter.emit("socket-event", {
		command: "update-offer",
		data: { offer: offerUpdated },
	});
	eventEmitter.emit("socket-event", {
		command: "new-receipt",
		data: { receipt:inserted},
		pubkeys: [receipt.pubkey,offerUpdated.pubkey],
	});

	return {receipt:inserted,skipped:false};
	
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
