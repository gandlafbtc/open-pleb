import { offerTable } from "@openPleb/common/db/schema";
import { ensureError } from "@openPleb/common/errors";
import { desc } from "drizzle-orm";
import Elysia from "elysia";
import { resolveDispute } from "../../business/offers/resolveDispute";
import { authFiatProviders } from "../../business/providers";
import { db } from "../../db/db";
import { environment } from "../../env";
import { log } from "../../logger";
import { authWS } from "./ws";

export const protectedRoutes = new Elysia()
	.get("/data", async ({ user, set }) => {
		try {
			if (!user) {
				return;
			}
			//todo prioritize disputed offers
			const offers = await db
				.select()
				.from(offerTable)
				.orderBy(desc(offerTable.createdAt))
				.limit(100);
			return { offers, env: environment };
		} catch (error) {
			set.status = 400;
			const err = ensureError(error);
			log.error("Error: {error}", { error });
			return {
				success: false,
				message: err.message,
				data: {},
			};
		}
	})
	.post("/resolvedispute", async ({ user, body, set }) => {
		try {
			if (!user) {
				return;
			}
			await resolveDispute(body);
			console.log(body);
			return {};
		} catch (error) {
			set.status = 400;
			const err = ensureError(error);
			log.error("Error: {error}", { error });
			return {
				success: false,
				message: err.message,
				data: {},
			};
		}
	})
	.use(authFiatProviders)
	.use(authWS);
