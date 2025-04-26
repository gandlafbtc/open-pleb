import type { PushSubscriber } from "@negrel/webpush";
import type { Offer } from "@openPleb/common/db/schema";
import { log } from "../logger";


export const subscribers: PushSubscriber[]  = []


export const notifyNewOfferSubs = async (o: Offer) => {
    const notificationPromises = subscribers.map(subscriber => {
        return subscriber.pushTextMessage(
            JSON.stringify({ title: "New offer available on openPleb!", body: `Pay ${o.amount} ${o.currency} and get ${o.satsAmount + o.takerFeeFlatRate + o.takerFeePercentage} sats!` }),
            {},
        ).catch(error => {
            log.info(`Failed to notify subscriber: ${error}`);
        });
    });
     
    await Promise.all(notificationPromises);
};
