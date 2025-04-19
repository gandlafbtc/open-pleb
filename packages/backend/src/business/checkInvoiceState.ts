import { CashuMint, MintQuoteState } from "@cashu/cashu-ts";
import { db } from "@openPleb/common/db";
import { type InsertProof, type MintQuote, offerTable, proofsTable } from "@openPleb/common/db/schema";
import { OFFER_STATE } from "@openPleb/common/types";
import { eq } from "drizzle-orm";
import { eventEmitter } from "../events/emitter";
import { wallet } from "../cashu/wallet";
import { InternalProofState } from "../types";

export const checkInvoiceState = async (
	quote: MintQuote,
	offerId: number,
): Promise<MintQuoteState> => {
	const mint = new CashuMint(Bun.env.PUBLIC_MINT_URL!);
	const { state } = await mint.checkMintQuote(quote.quote);
	if (state === MintQuoteState.PAID) {

		const proofs = await wallet.mintProofs(quote.amount, quote.quote, {
			// maybe lock to server pubkey?	
		})
		const proofsToInsert: InsertProof[] = proofs.map((p,i) => {
			return {
				id: p.secret,
				C: p.C,
				amount: quote.amount,
				secret: p.secret,
				identifier: i + 1,
				offerId,
				state: InternalProofState.UNSPENT,
			}
		})
		await db.insert(proofsTable).values(proofsToInsert)
		const offers = await db.select().from(offerTable).where(eq(offerTable.id, offerId));
		if (!offers.length) {
			throw new Error("Offer not found");
		}
		const offer = offers[0];
		if (offer.status !== OFFER_STATE.CREATED) {
			throw new Error("Invalid offer status");
		}
		const offerResponse = await db
			.update(offerTable)
			.set({
				status: OFFER_STATE.INVOICE_PAID,
				paidAt: Math.floor(Date.now() / 1000),
			})
			.where(eq(offerTable.id, offerId))
			.returning();
		eventEmitter.emit("socket-event", {
			command: "update-offer",
			data: { offer: offerResponse[0] },
		});
	}
	return state;
};