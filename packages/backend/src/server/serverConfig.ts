import cors from "@elysiajs/cors";
import swagger from "@elysiajs/swagger";
import { rateLimit } from "elysia-rate-limit";
import { version } from "../../package.json";

export const rateLimiter = rateLimit({
	duration: 60000,
	max: 1000,
});

export const swaggerDocs = swagger({
	path: "/docs",
	documentation: {
		info: {
			title: "OpenPleb Documentation",
			version,
		},
	},
});

export const corsConfig = cors({
	// origin: process.env.OPENPLEB_FRONTEND_URL,
});
