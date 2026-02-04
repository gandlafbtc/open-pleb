import { Elysia } from "elysia";
import { version } from "../package.json";
import { apiLogger, log } from "./util/logger";
import { afterInit, init } from "./server/init";
import { corsConfig, rateLimiter, swaggerDocs } from "./server/serverConfig";
import { v1Open } from "./api/v1/app/rest/v1";
import { v1WS } from "./api/v1/app/socket/v1";

// pre-server start initialize
await init();

log.info`Starting OpenPleb version ${version}...`;

const app = new Elysia()
	.use(apiLogger)
	// .use(expireOffersCron)
	// .use(updateConnectedCorn)
	.use(rateLimiter)
	.use(swaggerDocs)
	.use(corsConfig)
	.use(v1Open)
	.use(v1WS)
	.listen(Bun.env.OPENPLEB_PORT!);

log.info`OpenPleb 🚶 is running at ${app.server?.hostname}:${app.server?.port}`;

afterInit();
