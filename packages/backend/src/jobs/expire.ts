import { db } from "@openPleb/common/db";
import { offerTable } from "@openPleb/common/db/schema";
import { OFFER_STATE } from "@openPleb/common/types";
import { and, inArray, sql } from "drizzle-orm";
import { eventEmitter } from "../events/emitter";

export const expireOffers = async () => {
    
   const expiredOffers = await db.update(offerTable).set({
    status: OFFER_STATE.EXPIRED,
   }).where(and(sql`(${offerTable.createdAt} + ${offerTable.validForS}) < ${Math.floor(Date.now()/1000)}`, inArray(offerTable.status, [OFFER_STATE.INVOICE_PAID, OFFER_STATE.CLAIMED, OFFER_STATE.CREATED]))).returning()

   if (expiredOffers.length) {
        for (const offer of expiredOffers) {
            eventEmitter.emit("socket-event", {
                command: "update-offer",
                data: { offer },
            })
        }
   }

};