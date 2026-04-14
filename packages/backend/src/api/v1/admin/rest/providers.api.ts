import Elysia, { t } from "elysia";
import { providerAdminRepository } from "../../../../repository/admin/provider.repository";
import { ensureError } from "common/errors";
import { log } from "../../../../util/logger";
import { providerRepository } from "../../../../repository/app/provider.repository";

export const providersApi = (app: Elysia) =>
	app
		// Get all providers
		.get("/providers", async () => {
			try {
				const providers = await providerRepository.getAll();
				return providers;
			} catch (error) {
				const err = ensureError(error);
				log.error("Error getting providers", { error });
				return new Response(err.message, { status: 500 });
			}
		})
		// Get single provider
		.get("/providers/:id", async ({ params }) => {
			try {
				const id = parseInt(params.id);
				if (isNaN(id)) {
					return new Response("Invalid provider ID", { status: 400 });
				}
				const provider = await providerRepository.getById(id);
				if (!provider) {
					return new Response("Provider not found", { status: 404 });
				}
				return provider;
			} catch (error) {
				const err = ensureError(error);
				log.error("Error getting provider", { error });
				return new Response(err.message, { status: 500 });
			}
		}, {
			params: t.Object({
				id: t.String()
			})
		})
		// Create provider
		.post("/providers", async ({ body }) => {
			try {
				const provider = await providerAdminRepository.create({
					label: body.label,
					icon: body.icon,
					matchTemplate: body.matchTemplate || null
				});
				return provider;
			} catch (error) {
				const err = ensureError(error);
				log.error("Error creating provider", { error });
				return new Response(err.message, { status: 500 });
			}
		}, {
			body: t.Object({
				label: t.String(),
				icon: t.String(),
				matchTemplate: t.Optional(t.String())
			})
		})
		// Update provider
		.put("/providers/:id", async ({ params, body }) => {
			try {
				const id = parseInt(params.id);
				if (isNaN(id)) {
					return new Response("Invalid provider ID", { status: 400 });
				}
				const provider = await providerAdminRepository.update(id, {
					label: body.label,
					icon: body.icon,
					matchTemplate: body.matchTemplate || null
				});
				if (!provider) {
					return new Response("Provider not found", { status: 404 });
				}
				return provider;
			} catch (error) {
				const err = ensureError(error);
				log.error("Error updating provider", { error });
				return new Response(err.message, { status: 500 });
			}
		}, {
			params: t.Object({
				id: t.String()
			}),
			body: t.Object({
				label: t.Optional(t.String()),
				icon: t.Optional(t.String()),
				matchTemplate: t.Optional(t.String())
			})
		})
		// Delete provider
		.delete("/providers/:id", async ({ params }) => {
			try {
				const id = parseInt(params.id);
				if (isNaN(id)) {
					return new Response("Invalid provider ID", { status: 400 });
				}
				const deleted = await providerAdminRepository.delete(id);
				if (!deleted) {
					return new Response("Provider not found", { status: 404 });
				}
				return { success: true };
			} catch (error) {
				const err = ensureError(error);
				log.error("Error deleting provider", { error });
				return new Response(err.message, { status: 500 });
			}
		}, {
			params: t.Object({
				id: t.String()
			})
		});
