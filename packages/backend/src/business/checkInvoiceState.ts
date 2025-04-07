import { CashuMint, MintQuoteState } from "@cashu/cashu-ts";
import { db } from "@openPleb/common/db";
import { type MintQuote, offerTable } from "@openPleb/common/db/schema";
import { OFFER_STATE } from "@openPleb/common/types";
import { eq } from "drizzle-orm";
import { eventEmitter } from "../events/emitter";

export const checkInvoiceState = async ( //check the invoice state
	claim: MintQuote,
	offerId: number,
): Promise<MintQuoteState> => {
	const mint = new CashuMint(Bun.env.PUBLIC_MINT_URL!);
	const { state } = await mint.checkMintQuote(claim.quote);

	if (state === MintQuoteState.PAID) { //if the invoice is paid, update the offer status
		const offerResponse = await db
			.update(offerTable)
			.set({
				status: OFFER_STATE.INVOICE_PAID, //update the offer status to invoice paid
				validForS: 120, 				//valid for 2 minutes
				paidAt: Math.floor(Date.now() / 1000), //set the paid at time to now
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
