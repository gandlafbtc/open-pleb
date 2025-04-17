import { CashuMint, MintQuoteState } from "@cashu/cashu-ts";
import { db } from "@openPleb/common/db";
import { type MintQuote, offerTable } from "@openPleb/common/db/schema";
import { OFFER_STATE } from "@openPleb/common/types";
import { eq } from "drizzle-orm";
import { eventEmitter } from "../events/emitter";

export const checkInvoiceState = async (
	claim: MintQuote,
	offerId: number,
): Promise<MintQuoteState> => {
	const mint = new CashuMint(Bun.env.PUBLIC_MINT_URL!);
	const { state } = await mint.checkMintQuote(claim.quote);
	if (state === MintQuoteState.PAID) {
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
