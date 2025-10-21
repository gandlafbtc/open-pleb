import { Elysia } from "elysia";
import { version } from "../package.json";
import { v1 } from "./api/rest/v1";
import { expireOffersCron } from "./jobs/expire";
import { updateConnectedCorn } from "./jobs/updateConnected";
import { apiLogger, log } from "./logger";
import { afterInit, init } from "./server/init";
import { corsConfig, rateLimiter, swaggerDocs } from "./server/serverConfig";

// pre-server start initialize
await init();

log.info`Starting OpenPleb version ${version}...`;

const app = new Elysia()
	.use(apiLogger)
	.use(expireOffersCron)
	.use(updateConnectedCorn)
	.use(rateLimiter)
	.use(swaggerDocs)
	.use(corsConfig)
	.use(v1)

	.listen(Bun.env.OPENPLEB_PORT!);

log.info`OpenPleb 🚶 is running at ${app.server?.hostname}:${app.server?.port}`;

afterInit();
