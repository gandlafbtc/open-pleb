import { ensureError } from "@openPleb/common/errors";
import type Elysia from "elysia";
import { t } from "elysia";
import { checkInvoicePaid } from "../../../business/offers/checkInvoicePaid";
import { claimOffer } from "../../../business/offers/claim";
import { counterOrForfeitDispute } from "../../../business/offers/counterOrForfeit";
import { createInvoice } from "../../../business/offers/createInvoice";
import { commitFeedback } from "../../../business/offers/feedback";
import { payWithTokens } from "../../../business/offers/payWithTokens";
import { postOffer } from "../../../business/offers/post";
import { createReceipt, getReceipt } from "../../../business/offers/receipt";
import { log } from "../../../logger";

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
						amount: t.Number(),
						fiatProviderId: t.Optional(t.Number()),
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
					log.error("Error checking invoice offer {error}", {
						error,
					});
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
					log.error("Error creating invoice for offer {error}", {
						error,
					});
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
						payload: t.Object({
							status: t.String(),
							feedback: t.String(),
						}),
						nonce: t.String(),
						timestamp: t.Number(),
						signature: t.String(),
					}),
				},
			)
			.post(
				"/:id/counterorforfeit",
				async ({ params, body }) => {
					try {
						return await counterOrForfeitDispute(params.id, { ...body });
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
						payload: t.Object({
							response: t.String(),
							message: t.String(),
						}),
						nonce: t.String(),
						timestamp: t.Number(),
						signature: t.String(),
					}),
				},
			)
			.post(
				"/:id/claim",
				async ({ params, body }) => {
					try {
						const { pubkey, bond } = body;
						return await claimOffer(params.id, pubkey, bond);
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
						bond: t.String(),
					}),
				},
			)
			.post(
				"/:id/paywithtoken",
				async ({ params, body }) => {
					try {
						const { token } = body;
						return await payWithTokens(params.id, token);
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
						token: t.String(),
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
						const { receiptImg, pubkey, skip, reason } = body;
						return await createReceipt(params.id, {pubkey, receiptImg, skip, reason});
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
						pubkey:t.String(),
						receiptImg: t.Optional(t.String()),
						skip: t.Optional(t.Boolean()),
						reason:t.Optional(t.String()),
					}),
				},
			),
	);
