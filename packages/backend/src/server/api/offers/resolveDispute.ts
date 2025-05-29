// {
//     offerId: 47,
//     resolution: "RETURN",
//     resolutionReason: "sd",

import { OFFER_STATE, RESOLUTION_PATHS } from "@openPleb/common/types";
import { db } from "../../../db/db";
import { offerTable } from "@openPleb/common/db/schema";
import { eq } from "drizzle-orm";
import { handlePayouts } from "./feedback";

//   }
export const resolveDispute = async (
    body: { offerId: number; resolution: string; resolutionReason: string },
) => {
    const resolutionPaths = Object.values(RESOLUTION_PATHS);

    if (!resolutionPaths.includes(body.resolution)) {
        throw new Error("Invalid resolution path");
    }

    const [offer] = await db.select().from(offerTable).where(
        eq(offerTable.id, body.offerId),
    );

    if (!offer) {
        throw new Error("Offer not found");
    }

    switch (body.resolution) {
        case RESOLUTION_PATHS.RETURN:{
            const maker = offer.satsAmount +
            offer.takerFeeFlatRate +
            offer.takerFeePercentage +
            offer.bondFlatRate +
            offer.bondPercentage 
            const taker = offer.bondFlatRate + offer.bondPercentage
            await handlePayouts(offer, OFFER_STATE.RESOLVED, { maker, taker, resolutionReason: `${RESOLUTION_PATHS.RETURN}: ${body.resolutionReason}` })
            break;
        }
        case RESOLUTION_PATHS.MAKER_WINS: {
            const maker = offer.satsAmount +
            offer.takerFeeFlatRate +
            offer.takerFeePercentage +
            offer.bondFlatRate +
            offer.bondPercentage + offer.bondFlatRate + offer.bondPercentage
            await handlePayouts(offer, OFFER_STATE.RESOLVED, { maker, taker:0, resolutionReason: `${RESOLUTION_PATHS.MAKER_WINS}: ${body.resolutionReason}` })
            break;
        }
        case RESOLUTION_PATHS.TAKER_WINS:
            {
                const taker = offer.satsAmount +
                offer.takerFeeFlatRate +
                offer.takerFeePercentage +
                offer.bondFlatRate +
                offer.bondPercentage + offer.bondFlatRate + offer.bondPercentage
                await handlePayouts(offer, OFFER_STATE.RESOLVED, { maker:0, taker, resolutionReason: `${RESOLUTION_PATHS.TAKER_WINS}: ${body.resolutionReason}` })
                break;
            }
        case RESOLUTION_PATHS.SPLIT:
            {
                const half = Math.floor((offer.satsAmount +
                offer.takerFeeFlatRate +
                offer.takerFeePercentage +
                offer.bondFlatRate +
                offer.bondPercentage + offer.bondFlatRate + offer.bondPercentage)/2)
                await handlePayouts(offer, OFFER_STATE.RESOLVED, { maker:half, taker:half, resolutionReason: `${RESOLUTION_PATHS.SPLIT}: ${body.resolutionReason}` })
                break;
            }    
        default:
            throw new Error("Invalid resolution path");
    }
};
