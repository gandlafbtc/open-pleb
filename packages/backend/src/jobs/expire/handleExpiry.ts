import { db } from "@openPleb/common/db";
import { offerTable, proofsTable, type InsertProof, type Offer } from "@openPleb/common/db/schema";
import { OFFER_STATE } from "@openPleb/common/types";
import { and, eq } from "drizzle-orm";
import { eventEmitter } from "../../events/emitter";
import { wallet } from "../../cashu/wallet";
import { CheckStateEnum, getEncodedToken, OutputData, type Proof } from "@cashu/cashu-ts";
import { InternalProofState } from "../../types";

export const expireOffer = async (offer: Offer) => {
    const offers = await db.update(offerTable).set({ status: OFFER_STATE.EXPIRED }).where(eq(offerTable.id, offer.id)).returning();
                const updatedOffer = offers[0];
                eventEmitter.emit("socket-event", {
                    command: "update-offer",
                    data: { offer: updatedOffer },
                });
            }

export const expireOfferInvoicePaid = async (offer: Offer) => {
    
    const keys = await wallet.getKeys();
    //refund
    const sendAmount = offer.satsAmount + offer.takerFeeFlatRate +
    offer.takerFeePercentage + offer.bondFlatRate +
    offer.bondPercentage;

    const makerPub = `02${offer.pubkey}`;
    const sendAmountOutputData = OutputData.createP2PKData(
        {
            pubkey: makerPub,
        },
        sendAmount,
        keys,
    );
    const proofsFromDb = await db.select().from(proofsTable).where(
        and(
            eq(proofsTable.state, CheckStateEnum.UNSPENT),
            eq(proofsTable.offerId, offer.id),
        ),
    );
    const proofs: Proof[] = proofsFromDb.map((p) => {
        return {
            secret: p.secret,
            amount: p.amount,
            id: p.id,
            C: p.C,
        };
    });

    const { keep, send } = await wallet.send(
        sendAmount,
        proofs,
        {
            outputData: {
                send: sendAmountOutputData,
            },
        },
    );
    const proofsToInsert: InsertProof[] = [...keep, ...send].map((p) => {
        return {
            id: p.id,
            C: p.C,
            amount: p.amount,
            secret: p.secret,
            offerId: offer.id,
            state: InternalProofState.PENDING,
        };
    });

    await db.insert(proofsTable).values(proofsToInsert);

    const refundToken = getEncodedToken({
        mint: Bun.env.PUBLIC_MINT_URL!,
        proofs: send,
    });

    const offers = await db.update(offerTable).set({ status: OFFER_STATE.EXPIRED, refund: refundToken }).where(eq(offerTable.id, offer.id)).returning();
    const updatedOffer = offers[0];
    eventEmitter.emit("socket-event", {
        command: "update-offer",
        data: { offer: updatedOffer },
    });
}