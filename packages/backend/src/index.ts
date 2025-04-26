import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { Elysia } from "elysia";

import cron from "@elysiajs/cron";
import { logger } from "@grotto/logysia";
import * as webpush from "@negrel/webpush";
import { subscriptionsTable } from "@openPleb/common/db/schema";
import { encodeBase64Url } from "@std/encoding/base64url";
import { rateLimit } from "elysia-rate-limit";
import { version } from "../package.json";
import { db } from "./db/db";
import { subscribers } from "./dynamic/subscribers";
import { expireOffers } from "./jobs/expire";
import { updateConnected } from "./jobs/updateConnected";
import { log } from "./logger";
import { open } from "./server/open";

log.info`Starting OpenPleb version ${version}...`;

// Check all required environment variables before starting the service
const requiredEnvVars = [
	"PORT",
	"FRONTEND_URL",
	"DATABASE_URL",
	"CASHU_SEED_PHRASE",
	"LOG_FILE_NAME",
	"PUBLIC_PLATFORM_FEE_PERCENTAGE",
	"PUBLIC_PLATFORM_FEE_FLAT_RATE",
	"PUBLIC_TAKER_FEE_PERCENTAGE",
	"PUBLIC_TAKER_FEE_FLAT_RATE",
	"PUBLIC_MINT_URL",
	"PUBLIC_BOND_PERCENTAGE",
	"PUBLIC_BOND_FLAT_RATE",
	"PUBLIC_CURRENCY",
	"PUBLIC_MAX_FIAT_AMOUNT",
];

for (const envVar of requiredEnvVars) {
	if (!Bun.env[envVar]) {
		log.error(`No ${envVar} environment variable set`);
		process.exit(1);
	}
}

const exportedVapidKeys = JSON.parse(await Bun.file("./vapid.json").text());
const vapidKeys = await webpush.importVapidKeys(exportedVapidKeys, {
	extractable: false,
});
const appServer = await webpush.ApplicationServer.new({
	contactInformation: "mailto:gandlaf@proton.me",
	vapidKeys,
});

const loadSubscribersFromDBIntoMemory = async () => {
	const subscriptions = await db.select().from(subscriptionsTable);
	for (const subscription of subscriptions) {
		const parsedSubscription = JSON.parse(subscription.subscription);
		const subscriber = appServer.subscribe(parsedSubscription);
		subscribers.push(subscriber);
	}
};
await loadSubscribersFromDBIntoMemory();
const app = new Elysia()
	.use(
		logger({
			logIP: false,
			writer: {
				write: (m: string) => {
					log.debug(m);
				},
			},
		}),
	)
	.use(
		cron({
			name: "expire-offers",
			// run every 5 seconds
			pattern: "*/5 * * * * *",
			run() {
				expireOffers();
			},
		}),
	)
	.use(
		cron({
			name: "update-connections",
			// run every 10 seconds
			pattern: "*/10 * * * * *",
			run() {
				updateConnected();
			},
		}),
	)
	.use(
		rateLimit({
			duration: 60000,
			max: 1000,
		}),
	)
	.use(
		swagger({
			path: "/docs",
			documentation: {
				info: {
					title: "OpenPleb Documentation",
					version,
				},
			},
		}),
	)
	.use(
		cors({
			// origin: process.env.FRONTEND_URL,
		}),
	)
	.group("/api/v1", (app) => app.use(open))
	.get("/vapid", async () => {
		const publicKey = encodeBase64Url(
			await crypto.subtle.exportKey("raw", vapidKeys.publicKey),
		);
		return { publicKey };
	})
	.post("/subscribe", async ({ body }) => {
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
		const subscriber = appServer.subscribe(subscription);

		// Send notification.
		await subscriber.pushTextMessage(
			JSON.stringify({
				title: "OpenPleb notifications enabled!",
				body: "You will now receive notifications on new offers!",
			}),
			{},
		);

		subscribers.push(subscriber);

		// OK.
		return new Response();
	})
	.listen(Bun.env.PORT);

log.info`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`;
