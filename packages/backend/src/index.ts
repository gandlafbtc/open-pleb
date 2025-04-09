import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { Elysia } from "elysia";

import cron from "@elysiajs/cron";
import { logger } from "@grotto/logysia";
import { rateLimit } from "elysia-rate-limit";
import { version } from "../package.json";
import { log } from "./logger";
import { open } from "./server/open";

log.info`Starting OpenPleb version ${version}...`;

if (!Bun.env.PORT) {
	log.error("No PORT environment variable set");
	process.exit(1);
}

if (!Bun.env.FRONTEND_URL) {
	log.error("No FRONTEND_URL environment variable set");
	process.exit(1);
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
			name: "jobs",
			pattern: "*/1 * * * *",
			// pattern: '*/10 * * * * *',
			run() {
				console.log("Running jobs...");
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
