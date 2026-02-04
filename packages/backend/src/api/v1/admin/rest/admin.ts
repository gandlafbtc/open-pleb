import Elysia from "elysia";
import { ensureError } from "../../../../util/errors";
import { log } from "../../../../util/logger";

export const admin = (app: Elysia) =>
	app
		.get("/conversion", async () => {
			try {
			} catch (error) {
				const err = ensureError(error);
				log.error("Error {error}", { error });
				return new Response(err.message, {
					status: 500,
				});
			}
		})
