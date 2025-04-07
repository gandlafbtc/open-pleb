import { db } from "@openPleb/common/db";
import { mintQuotesTable } from "@openPleb/common/db/schema";
import { eq } from "drizzle-orm";
import { checkInvoiceState } from "../../../business/checkInvoiceState";

export const checkInvoicePaid = async (id: string) => {
	if (!id) {
		return new Response("Invalid request", { status: 400 });
	}
	const offerId = Number.parseInt(id);
	if (Number.isNaN(offerId)) {
		return new Response("Invalid offer ID", { status: 400 });
	}

	const quotes = await db
		.select()
		.from(mintQuotesTable)
		.where(eq(mintQuotesTable.offerId, offerId));

	if (quotes.length === 0) {
		return new Response("Claim not found", { status: 404 });
	}

	const state = await checkInvoiceState(quotes[0], offerId);

	return { state };
};
