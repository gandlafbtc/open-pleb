import { ensureError } from "@openPleb/common/errors";
import type Elysia from "elysia";
import { t } from "elysia";
import { log } from "../../../logger";
import { checkInvoicePaid } from "./checkInvoicePaid";
import { claimOffer } from "./claim";
import { commitFeedback } from "./feedback";
import { postOffer } from "./post";
import { createReceipt, getReceipt } from "./receipt";
import { createInvoice } from "./createInvoice";

export const offers = (app: Elysia) =>
	app.group("/offers", (app) =>
		app
			.get("/", async () => {
				return "hello";
			})
			.post(
				"/",
				async ({ body }) => {
					try {
						return await postOffer(body);
					} catch (error) {
						const err = ensureError(error);
						log.error("Error creating offer {error}", { error });
						return new Response(err.message, {
							status: 500,
						});
					}
				},
				{
					body: t.Object({
						qrCode: t.String(),
						amount: t.Number({ minimum: 1 }),
						pubkey: t.String(),
						token: t.Optional(t.String()),
					}),
				},
			)
			.get("/:id/checkpaidinvoice", async ({ params }) => {
				try {
					return await checkInvoicePaid(params.id);
				} catch (error) {
					const err = ensureError(error);
					log.error("Error checking invoice offer {error}", { error });
					return new Response(err.message, {
						status: 500,
					});
				}
			})
			.get("/:id/createinvoice", async ({ params }) => {
				try {
					return await createInvoice(params.id);
				} catch (error) {
					const err = ensureError(error);
					log.error("Error creating invoice for offer {error}", { error });
					return new Response(err.message, {
						status: 500,
					});
				}
			})
			.post(
				"/:id/feedback",
				async ({ params, body }) => {
					try {
						return await commitFeedback(params.id, { ...body });
					} catch (error) {
						const err = ensureError(error);
						log.error("Error posting feedback {error}", { error });
						return new Response(err.message, {
							status: 500,
						});
					}
				},
				{
					body: t.Object({
						feedback: t.String(),
						signature: t.String(),
						status: t.String(),
						nonce: t.String(),
					}),
				},
			)
			.post(
				"/:id/claim",
				async ({ params, body }) => {
					try {
						const { pubkey } = body;
						return await claimOffer(params.id, pubkey);
					} catch (error) {
						const err = ensureError(error);
						log.error("Error posting claim {error}", { error });
						return new Response(err.message, {
							status: 500,
						});
					}
				},
				{
					body: t.Object({
						pubkey: t.String(),
					}),
				},
			)
			.get("/:id/receipt", async ({ params }) => {
				try {
					const receipt = await getReceipt(params.id);
				} catch (error) {
					const err = ensureError(error);
					log.error("Error getting receipt {error}", { error });
					return new Response(err.message, {
						status: 500,
					});
				}
			})
			.post(
				"/:id/receipt",
				async ({ params, body }) => {
					try {
						const { receipt, pubkey } = body;
						return await createReceipt(params.id, pubkey, receipt);
					} catch (error) {
						const err = ensureError(error);
						log.error("Error posting receipt  {error}", { error });
						return new Response(err.message, {
							status: 500,
						});
					}
				},
				{
					body: t.Object({
						receipt: t.String(),
						pubkey: t.String(),
					}),
				},
			),
	);
