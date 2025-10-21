import cron from "@elysiajs/cron";
import { db } from "@openPleb/common/db";
import { offerTable } from "@openPleb/common/db/schema";
import { ensureError } from "@openPleb/common/errors";
import { OFFER_STATE } from "@openPleb/common/types";
import { and, inArray, sql } from "drizzle-orm";
import { handlePayouts } from "../business/offers/feedback";
import { log } from "../logger";
import { expireOffer, expireOfferInvoicePaid } from "./expire/handleExpiry";

export const expireOffersCron = cron({
	name: "expire-offers",
	// run every 5 seconds
	pattern: "*/5 * * * * *",
	run() {
		try {
			expireOffers();
		} catch (error) {
			const err = ensureError(error);
			log.error("Error: {error}", { error });
		}
	},
});

export const expireOffers = async () => {
	const expiredOffers = await db
		.select()
		.from(offerTable)
		.where(
			and(
				sql`(${offerTable.createdAt} + ${offerTable.validForS}) < ${Math.floor(
					Date.now() / 1000,
				)}`,
				inArray(offerTable.status, [
					OFFER_STATE.INVOICE_PAID,
					OFFER_STATE.INVOICE_CREATED,
					OFFER_STATE.CLAIMED,
					OFFER_STATE.CREATED,
					OFFER_STATE.RECEIPT_SUBMITTED,
					OFFER_STATE.MARKED_WITH_ISSUE,
					OFFER_STATE.FOREFEIT,
				]),
			),
		);

	for (const offer of expiredOffers) {
		switch (offer.status) {
			case OFFER_STATE.CREATED: {
				await expireOffer(offer);
				break;
			}
			case OFFER_STATE.INVOICE_CREATED: {
				await expireOffer(offer);
				break;
			}
			case OFFER_STATE.INVOICE_PAID: {
				await expireOfferInvoicePaid(offer);
				break;
			}
			case OFFER_STATE.CLAIMED: {
				//refund and refund taker bond?
				await expireOfferInvoicePaid(offer);
				break;
			}
			case OFFER_STATE.MARKED_WITH_ISSUE: {
				//refund and refund taker bond?
				await expireOfferInvoicePaid(offer);
				break;
			}
			case OFFER_STATE.FOREFEIT: {
				await expireOfferInvoicePaid(offer);
				break;
			}
			case OFFER_STATE.RECEIPT_SUBMITTED: {
				//payout
				await handlePayouts(offer, OFFER_STATE.EXPIRED);
				break;
			}
			default:
				break;
		}
	}
};
