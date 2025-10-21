import { db } from "@openPleb/common/db";
import { fiatProviderTable } from "@openPleb/common/db/schema";
import { ensureError } from "@openPleb/common/errors";
import { eq } from "drizzle-orm";
import type Elysia from "elysia";
import { takeUniqueOrUndefinded } from "../db/orm-helper";
import { log } from "../logger";

export const authFiatProviders = (app: Elysia) =>
	app
		// Create a new fiat provider
		.post("/fiat-providers", async ({ user, set, body }) => {
			if (!user) {
				set.status = 401;
				return {
					success: false,
					message: "Unauthorized",
					data: null,
				};
			}

			try {
				const { label, icon, matchTemplate } = body as {
					label: string;
					icon: string;
					matchTemplate?: string;
				};

				// Validate required fields
				if (!label || !icon) {
					set.status = 400;
					return {
						success: false,
						message: "Label and icon are required",
						data: null,
					};
				}

				// Check if a provider with the same label already exists
				const existingProvider = await db
					.select()
					.from(fiatProviderTable)
					.where(eq(fiatProviderTable.label, label))
					.then(takeUniqueOrUndefinded);

				if (existingProvider) {
					set.status = 400;
					return {
						success: false,
						message: "A fiat provider with this label already exists",
						data: null,
					};
				}

				// Create new fiat provider
				const newProvider = await db
					.insert(fiatProviderTable)
					.values({
						label,
						icon,
						matchTemplate,
						createdAt: Math.ceil(Date.now() / 1000),
					})
					.returning();

				return {
					success: true,
					data: newProvider[0],
					message: "Fiat provider created successfully",
				};
			} catch (error) {
				set.status = 500;
				const err = ensureError(error);
				log.error("Error creating fiat provider: {error}", { error });
				return {
					success: false,
					message: err.message,
					data: null,
				};
			}
		})
		// Update an existing fiat provider
		.put("/fiat-providers/:id", async ({ user, set, params, body }) => {
			if (!user) {
				set.status = 401;
				return {
					success: false,
					message: "Unauthorized",
					data: null,
				};
			}

			try {
				const providerId = Number.parseInt(params.id);
				if (Number.isNaN(providerId)) {
					set.status = 400;
					return {
						success: false,
						message: "Invalid provider ID",
						data: null,
					};
				}

				const { label, icon, matchTemplate } = body as {
					label?: string;
					icon?: string;
					matchTemplate?: string;
				};

				// Check if provider exists
				const existingProvider = await db
					.select()
					.from(fiatProviderTable)
					.where(eq(fiatProviderTable.id, providerId))
					.then(takeUniqueOrUndefinded);

				if (!existingProvider) {
					set.status = 404;
					return {
						success: false,
						message: "Fiat provider not found",
						data: null,
					};
				}

				// Prepare update data
				const updateData: Record<string, unknown> = {};
				if (label !== undefined) updateData.label = label;
				if (icon !== undefined) updateData.icon = icon;
				if (matchTemplate !== undefined)
					updateData.matchTemplate = matchTemplate;

				// If label is being updated, check for duplicates
				if (label && label !== existingProvider.label) {
					const labelExists = await db
						.select()
						.from(fiatProviderTable)
						.where(eq(fiatProviderTable.label, label))
						.then(takeUniqueOrUndefinded);

					if (labelExists) {
						set.status = 400;
						return {
							success: false,
							message: "A fiat provider with this label already exists",
							data: null,
						};
					}
				}

				// Update provider
				if (Object.keys(updateData).length > 0) {
					const updatedProvider = await db
						.update(fiatProviderTable)
						.set(updateData)
						.where(eq(fiatProviderTable.id, providerId))
						.returning();

					return {
						success: true,
						data: updatedProvider[0],
						message: "Fiat provider updated successfully",
					};
				}
				return {
					success: true,
					data: existingProvider,
					message: "No changes to update",
				};
			} catch (error) {
				set.status = 500;
				const err = ensureError(error);
				log.error("Error updating fiat provider: {error}", { error });
				return {
					success: false,
					message: err.message,
					data: null,
				};
			}
		})
		// Delete a fiat provider
		.delete("/fiat-providers/:id", async ({ user, set, params }) => {
			if (!user) {
				set.status = 401;
				return {
					success: false,
					message: "Unauthorized",
					data: null,
				};
			}

			try {
				const providerId = Number.parseInt(params.id);
				if (Number.isNaN(providerId)) {
					set.status = 400;
					return {
						success: false,
						message: "Invalid provider ID",
						data: null,
					};
				}

				// Check if provider exists
				const existingProvider = await db
					.select()
					.from(fiatProviderTable)
					.where(eq(fiatProviderTable.id, providerId))
					.then(takeUniqueOrUndefinded);

				if (!existingProvider) {
					set.status = 404;
					return {
						success: false,
						message: "Fiat provider not found",
						data: null,
					};
				}

				// Delete provider
				await db
					.delete(fiatProviderTable)
					.where(eq(fiatProviderTable.id, providerId));

				return {
					success: true,
					data: null,
					message: "Fiat provider deleted successfully",
				};
			} catch (error) {
				set.status = 500;
				const err = ensureError(error);
				log.error("Error deleting fiat provider: {error}", { error });
				return {
					success: false,
					message: err.message,
					data: null,
				};
			}
		});
