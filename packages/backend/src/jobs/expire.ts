import { db } from "@openPleb/common/db";
import { offerTable } from "@openPleb/common/db/schema";
import { OFFER_STATE } from "@openPleb/common/types";
import { and, inArray, sql } from "drizzle-orm";
import { expireOffer, expireOfferInvoicePaid } from "./expire/handleExpiry";
import { handlePayouts } from "../server/api/offers/feedback";

export const expireOffers = async () => {
    const expiredOffers = await db.select().from(offerTable).where(
        and(
            sql`(${offerTable.createdAt} + ${offerTable.validForS}) < ${
                Math.floor(Date.now() / 1000)
            }`,
            inArray(offerTable.status, [
                OFFER_STATE.INVOICE_PAID,
                OFFER_STATE.INVOICE_CREATED,
                OFFER_STATE.CLAIMED,
                OFFER_STATE.CREATED,
                OFFER_STATE.RECEIPT_SUBMITTED,
            ]),
        ),
    )

    for (const offer of expiredOffers) {
        switch (offer.status) {
            case OFFER_STATE.CREATED: {
                await expireOffer(offer)
                break;
            }
            case OFFER_STATE.INVOICE_CREATED:{
                await expireOffer(offer)
                break;
            }
            case OFFER_STATE.INVOICE_PAID:{
               await expireOfferInvoicePaid(offer)
                break;
            }
            case OFFER_STATE.CLAIMED:{
                //refund and refund taker bond
                await expireOfferInvoicePaid(offer)
                break;
            }
            case OFFER_STATE.RECEIPT_SUBMITTED:{
                //payout
                await handlePayouts(offer, "Expired", OFFER_STATE.EXPIRED)
                break;
            }default:
                break;
        }
    }
};
