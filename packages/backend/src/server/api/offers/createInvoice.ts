import { db } from "@openPleb/common/db";
import { mintQuotesTable, offerTable } from "@openPleb/common/db/schema";
import { eq } from "drizzle-orm";
import { CashuMint } from "@cashu/cashu-ts";
import { OFFER_STATE } from "@openPleb/common/types";
import { eventEmitter } from "../../../events/emitter";

export const createInvoice = async (id: string) => {
	if (!id) {
		return new Response("Invalid request", { status: 400 });
	}
	const offerId = Number.parseInt(id);
	if (Number.isNaN(offerId)) {
		return new Response("Invalid offer ID", { status: 400 });
	}

	const offers = await db
		.select()
		.from(offerTable)
		.where(eq(offerTable.id, offerId));


	if (!offers.length) {
		return new Response("offer not found", { status: 404 });
	}

    
    const offer = offers[0]

    if (offer.status !== OFFER_STATE.CREATED) {
        return new Response("Offer is not in the created state", { status: 400 });
    }

    if (offer.invoice) {
        return new Response("Invoice already exists for this offer", { status: 200 });
    }

    const totalAmount =
        offer.satsAmount +
        offer.platformFeePercentage +
        offer.takerFeePercentage +
        offer.platformFeeFlatRate +
        offer.takerFeeFlatRate +
        offer.bondPercentage + 
        offer.bondFlatRate  
        ;

	const cashuMint = new CashuMint(Bun.env.PUBLIC_MINT_URL!);

    // Create a mint quote for the total amount
	// This will return a Lightning invoice that the maker will pay
	const res = await cashuMint.createMintQuote( {
		amount: totalAmount,
		unit: "sat",
	});

    const offerResponse = await db
    .update(offerTable)
    .set({ invoice: res.request, status: OFFER_STATE.INVOICE_CREATED }).where(eq(offerTable.id, offerId))
    .returning();

    await db.insert(mintQuotesTable).values({
        ...res,
        amount: totalAmount,
        offerId: offerResponse[0].id,
    });

    eventEmitter.emit("socket-event", {
        command: "update-offer",
        data: { offer: offerResponse[0] },
    });

	return { offer };
};
