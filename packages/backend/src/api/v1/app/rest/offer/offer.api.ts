import { Elysia, t } from "elysia";
import * as offerBusiness from "../../../../../business/app/offer.business";
import { log } from "../../../../../util/logger";

export const offerApi = new Elysia({ prefix: "/offer" })
	.post(
		"/",
		async ({ body, set }) => {
			try {
				const { sessionId, fiatAmount, fiatProviderId, fiatAddress, description } = body;

				// Create offer (validation happens in business layer)
				const offer = await offerBusiness.createOffer({
					sessionId,
					fiatAmount,
					fiatProviderId,
					fiatAddress,
					description,
				});

				return {
					success: true,
					offer,
				};
			} catch (error) {
				if (error instanceof Error) {
					log.error(error);
				}

				// Handle specific error cases
				if (error instanceof Error) {
					if (error.message.includes("Session not found")) {
						set.status = 404;
						return { error: "Session not found" };
					}
					if (error.message.includes("Session has expired")) {
						set.status = 401;
						return { error: "Session has expired" };
					}
					if (error.message.includes("Only maker sessions")) {
						set.status = 403;
						return { error: "Only maker sessions can create offers" };
					}
					if (error.message.includes("already has an offer")) {
						set.status = 409;
						return { error: "Session already has an offer" };
					}
					if (
						error.message.includes("must be greater than 0") ||
						error.message.includes("exceeds maximum") ||
						error.message.includes("is required") ||
						error.message.includes("too long")
					) {
						set.status = 400;
						return { error: error.message };
					}
				}

				set.status = 500;
				return { error: "Failed to create offer" };
			}
		},
		{
			body: t.Object({
				sessionId: t.String(),
				fiatAmount: t.Number(),
				fiatProviderId: t.Nullable(t.Number()),
				fiatAddress: t.String(),
				description: t.Optional(t.String()),
			}),
		}
	);
