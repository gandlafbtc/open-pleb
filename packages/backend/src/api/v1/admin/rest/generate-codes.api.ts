import Elysia, { t } from "elysia";
import { ensureError } from "../../../../util/errors";
import { log } from "../../../../util/logger";
import * as biz from "../../../../business/admin/generate-codes.business";



export const generateCodes = (app: Elysia) =>
	app
		.post("/generate-codes", async ({ body }) => {
			try {
				const { count, expiresAt } = body;
				
				// Validate inputs
				const codes = await biz.generateCodes(count, expiresAt);
				
				return { 
					success: true,
					count: codes.length,
					codes 
				};
			} catch (error) {
				const err = ensureError(error);
				log.error("Error {error}", { error });
				return new Response(err.message, {
					status: 500,
				});
			}
		}, {
			body: t.Object({
				count: t.Number({ minimum: 1 }),
				expiresAt: t.Optional(t.Number())
			})
		})
