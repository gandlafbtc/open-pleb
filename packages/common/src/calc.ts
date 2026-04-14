import type { Offer } from "./db/schema"
import type { PublicOffer } from "./types"

export const calcMakerBondForOffer = (offer: Offer | PublicOffer) => {
    return Math.floor(
		offer.makerBondFlatRate + (offer.satsAmount * offer.makerBondPercentage) / 100)
}

export const calcMakerFeeForOffer = (offer: Offer | PublicOffer) => {
    return Math.floor(
		offer.platformFeeFlatRate + offer.takerFeeFlatRate + (offer.satsAmount * (offer.platformFeePercentage+offer.takerFeePercentage)) / 100)
}
export const calcTakerFee = (offer: Offer | PublicOffer) => {
    return Math.floor(
		offer.takerFeeFlatRate + (offer.satsAmount * offer.takerFeePercentage) / 100)
}

export const calcMakerTotalForOffer = (offer: Offer | PublicOffer) => {
    return calcMakerBondForOffer(offer) + offer.satsAmount + calcMakerFeeForOffer(offer)
}

export const calcTakerBond = (offer: Offer | PublicOffer) => {
    return Math.floor(
		offer.takerBondFlatRate + (offer.satsAmount * offer.takerBondPercentage) / 100)
}


