import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { Elysia } from "elysia";
import jwt from "@elysiajs/jwt";

import cron from "@elysiajs/cron";
import { logger } from "@grotto/logysia";
import * as webpush from "@negrel/webpush";
import { subscriptionsTable, vapidKeysTable } from "@openPleb/common/db/schema";
import { encodeBase64Url } from "@std/encoding/base64url";
import { rateLimit } from "elysia-rate-limit";
import { version } from "../package.json";
import { db } from "./db/db";
import { subscribers } from "./dynamic/subscribers";
import { expireOffers } from "./jobs/expire";
import { updateConnected } from "./jobs/updateConnected";
import { log } from "./logger";
import { open } from "./server/open";
import { auth } from "./server/auth/auth";
import { ensureError } from "@openPleb/common/errors";
import { migrate } from "drizzle-orm/postgres-js/migrator";

if (!process.env.OPENPLEB_MIGRATIONS_DIR) {
	log.error("OPENPLEB_MIGRATIONS_DIR environment variable is not set");
	process.exit(1);
}

log.info`migrating db...`;

await migrate(db, {migrationsFolder: process.env.OPENPLEB_MIGRATIONS_DIR });

log.info`Starting OpenPleb version ${version}...`;

// Check all required environment variables before starting the service
const requiredEnvVars = [
	"PORT",
	"FRONTEND_URL",
	"DATABASE_URL",
	"CASHU_SEED_PHRASE",
	"LOG_FILE_NAME",
	"OPENPLEB_CONTACT",
	"OPENPLEB_PLATFORM_FEE_PERCENTAGE",
	"OPENPLEB_PLATFORM_FEE_FLAT_RATE",
	"OPENPLEB_TAKER_FEE_PERCENTAGE",
	"OPENPLEB_TAKER_FEE_FLAT_RATE",
	"OPENPLEB_MINT_URL",
	"OPENPLEB_BOND_PERCENTAGE",
	"OPENPLEB_BOND_FLAT_RATE",
	"OPENPLEB_CURRENCY",
	"OPENPLEB_MAX_FIAT_AMOUNT",
	"JWT_SECRET"
];

for (const envVar of requiredEnvVars) {
	if (!Bun.env[envVar]) {
		log.error(`No ${envVar} environment variable set`);
		process.exit(1);
	}
}

let [exportedVapidKeys] = await db.select().from(vapidKeysTable)

if (!exportedVapidKeys) {
	const cryptoKeyPair = await webpush.generateVapidKeys({extractable: true })
	const newExportedVapidKeys = await webpush.exportVapidKeys(cryptoKeyPair)
	const newExportedVapidKeysJSON = JSON.stringify(newExportedVapidKeys)
	const inserted = await db.insert(vapidKeysTable).values({ vapidJSON: newExportedVapidKeysJSON, createdAt: Math.ceil(Date.now()/1000) }).returning();
	exportedVapidKeys = inserted[0];
}

const vapidKeys = await webpush.importVapidKeys(JSON.parse(exportedVapidKeys.vapidJSON), {
	extractable: false,
});
const appServer = await webpush.ApplicationServer.new({
	contactInformation: Bun.env.OPENPLEB_CONTACT??'',
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
				try {
					expireOffers();
				} catch (error) {
					const err = ensureError(error);
					log.error("Error: {error}", { error });				
				}
			},
		}),
	)
	.use(
		cron({
			name: "update-connections",
			// run every 10 seconds
			pattern: "*/10 * * * * *",
			run() {
				try {
					
					updateConnected();
				} catch (error) {
					const err = ensureError(error);
					log.error("Error: {error}", { error });
				}
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
	.get("/vapid", async ({set}) => {
		try {
			const publicKey = encodeBase64Url(
				await crypto.subtle.exportKey("raw", vapidKeys.publicKey),
			);
			return { publicKey };
		} catch (error) {
			set.status = 400
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
		} catch (error) {
			set.status = 400
			const err = ensureError(error);
			log.error("Error: {error}", { error });
			return {
                success: false,
                message: err.message,
                data: null,
            };
		}
	}).group("/admin", (app) =>
		app
			.use(
				jwt({
					name: "jwt",
					// biome-ignore lint/style/noNonNullAssertion: <explanation>
					secret: Bun.env.JWT_SECRET!,
					exp: "7d",
				}),
			)
			.use(auth),
	)
	.listen(Bun.env.PORT);

log.info`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`;
