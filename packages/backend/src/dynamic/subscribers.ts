import type { PushSubscriber } from "@negrel/webpush";
import type { Offer } from "@openPleb/common/db/schema";


export const subscribers: PushSubscriber[]  = []


export const notifyNewOfferSubs = async (o: Offer) => {
    for (const subscriber of subscribers) {
		subscriber.pushTextMessage(
			JSON.stringify({ title: "New offer available on openPleb!", body: `Pay ${o.amount} ${o.currency} and get ${o.satsAmount + o.takerFeeFlatRate + o.takerFeePercentage} sats!` }),
			{},
		  );		
	}
};