import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { Elysia } from "elysia";

import cron from "@elysiajs/cron";
import { logger } from "@grotto/logysia";
import { rateLimit } from "elysia-rate-limit";
import { version } from "../package.json";
import { log } from "./logger";
import { open } from "./server/open";
import { expireOffers } from "./jobs/expire";
import { updateConnected } from "./jobs/updateConnected";

log.info`Starting OpenPleb version ${version}...`;

// Check all required environment variables before starting the service
const requiredEnvVars = [
  'PORT',
  'FRONTEND_URL',
  'DATABASE_URL',
  'CASHU_SEED_PHRASE',
  'LOG_FILE_NAME',
  'PUBLIC_PLATFORM_FEE_PERCENTAGE',
  'PUBLIC_PLATFORM_FEE_FLAT_RATE',
  'PUBLIC_TAKER_FEE_PERCENTAGE',
  'PUBLIC_TAKER_FEE_FLAT_RATE',
  'PUBLIC_MINT_URL',
  'PUBLIC_BOND_PERCENTAGE',
  'PUBLIC_BOND_FLAT_RATE',
  'PUBLIC_CURRENCY',
  'PUBLIC_MAX_FIAT_AMOUNT'
];

for (const envVar of requiredEnvVars) {
  if (!Bun.env[envVar]) {
    log.error(`No ${envVar} environment variable set`);
    process.exit(1);
  }
}

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
			pattern: '*/5 * * * * *',
			run() {
				expireOffers()
			},
		}),
	)
	.use(
		cron({
			name: "update-connections",
			// run every 10 seconds
			pattern: '*/10 * * * * *', 
			run() {
				updateConnected()
			},
		}),
	)
	.use(
		rateLimit({
			duration: 30000,
			max: 100,
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
	.group("/api/v1", (app) =>
		app
			.use(
				cors({
					// origin: process.env.FRONTEND_URL,
				}),
			)
			.use(open),
	)
	.listen(Bun.env.PORT);
log.info`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`;
