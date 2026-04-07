import { Elysia, t } from "elysia";
import * as sessionBusiness from "../../../../../business/app/session.business";
import { log } from "../../../../../util/logger";

export const batApi = new Elysia({ prefix: "/bat" })
	.post(
		"/",
		async ({ body, set }) => {
			try {
				const { auth_proof, role } = body;

				// Create blind session (validation happens in business layer)
				const session = await sessionBusiness.createBlindSession(auth_proof, role);

				return {
					success: true,
					session,
				};
			} catch (error) {
				if (error instanceof Error) {
					log.error(error);
				}

				// Handle specific error cases
				if (error instanceof Error) {
					if (error.message.includes("already spent") || error.message.includes("already used")) {
						set.status = 401;
						return { error: "BAT is invalid or already spent" };
					}
					if (error.message.includes("Invalid role")) {
						set.status = 400;
						return { error: error.message };
					}
					if (error.message.includes("Failed to validate") || error.message.includes("Failed to spend")) {
						set.status = 503;
						return { error: "Unable to validate BAT with mint" };
					}
				}

				set.status = 500;
				return { error: "Failed to create session" };
			}
		},
		{
			body: t.Object({
				auth_proof: t.Object({
					id: t.String(),
					secret: t.String(),
					C: t.String(),
					dleq: t.Optional(t.Any()),
				}),
				role: t.String(),
			}),
		}
	);
