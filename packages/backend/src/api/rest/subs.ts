import { subscriptionsTable } from "@openPleb/common/db/schema";
import { ensureError } from "@openPleb/common/errors";
import { encodeBase64Url } from "@std/encoding/base64url";
import Elysia from "elysia";
import { db } from "../../db/db";
import { subscribers } from "../../dynamic/subscribers";
import { VapidKeys } from "../../dynamic/vapidKeys";
import { log } from "../../logger";

export const subsAPI = new Elysia()
	.get("/vapid", async ({ set }) => {
		try {
			const publicKey = encodeBase64Url(
				await crypto.subtle.exportKey(
					"raw",
					VapidKeys.getInstance().vapidKeys.publicKey,
				),
			);
			return { publicKey };
		} catch (error) {
			set.status = 400;
			const err = ensureError(error);
			log.error("Error: {error}", { error });
			return {
				success: false,
				message: err.message,
				data: null,
			};
		}
	})
	.post("/subscribe", async ({ body, set }) => {
		try {
			// Retrieve subscription.
			const { subscription } = body;
			// You can store it in a DB to reuse it later.
			// ...
			console.log(subscription);

			await db.insert(subscriptionsTable).values({
				subscription: JSON.stringify(subscription),
				createdAt: Math.ceil(Date.now() / 1000),
			});
			// Create a subscriber object.
			const subscriber =
				VapidKeys.getInstance().appServer.subscribe(subscription);

			// Send notification.
			await subscriber.pushTextMessage(
				JSON.stringify({
					title: "OpenPleb notifications enabled!",
					body: "You will now receive notifications on new offers!",
				}),
				{},
			);

			subscribers.push(subscriber);

			return new Response();
		} catch (error) {
			set.status = 400;
			const err = ensureError(error);
			log.error("Error: {error}", { error });
			return {
				success: false,
				message: err.message,
				data: null,
			};
		}
	});
