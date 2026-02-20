import Elysia from "elysia";
import { getConversionRate } from "../../../../util/conversion";
import { ensureError } from "../../../../util/errors";
import { log } from "../../../../util/logger";
import { environment } from "../../../../env";
import * as user from "../../../../business/app/user.business";

export const open = (app: Elysia) =>
	app
		.get("/conversion", async () => {
			try {
				const conversion = await getConversionRate();
				return { conversion };
			} catch (error) {
				const err = ensureError(error);
				log.error("Error getting conversion rate: {error}", { error });
				return new Response(err.message, {
					status: 500,
				});
			}
		})
		.get("/envsettings", async () => {
			try {
				return {
					env: environment,
				};
			} catch (error) {
				const err = ensureError(error);
				log.error("Error getting env settings: {error}", { error });
				return new Response(err.message, {
					status: 500,
				});
			}
		})
		.get("/user/:pubkey", async ({ params: { pubkey } }) => {
			try {
				return {
					isInvited: await user.isUserInvited(pubkey)
				}
			} catch (error) {
				const err = ensureError(error);
				log.error("Error loading user: {error}", { error });
				return new Response(err.message, {
					status: 500,
				});
			}
		})
	;
