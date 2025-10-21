import { db } from "@openPleb/common/db";
import { fiatProviderTable } from "@openPleb/common/db/schema";
import { ensureError } from "@openPleb/common/errors";
import { eq } from "drizzle-orm";
import type Elysia from "elysia";
import { takeUniqueOrUndefinded } from "../../../db/orm-helpers/orm-helper";
import { log } from "../../../logger";

export const fiatProviders = (app: Elysia) =>
	app
		.get("/fiat-providers", async ({ set }) => {
			try {
				const providers = await db.select().from(fiatProviderTable);
				return {
					success: true,
					data: providers,
					message: "Fiat providers fetched successfully",
				};
			} catch (error) {
				set.status = 500;
				const err = ensureError(error);
				log.error("Error fetching fiat providers: {error}", { error });
				return {
					success: false,
					message: err.message,
					data: null,
				};
			}
		})
		// Get a specific fiat provider by ID
		.get("/fiat-providers/:id", async ({ set, params }) => {
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

				const provider = await db
					.select()
					.from(fiatProviderTable)
					.where(eq(fiatProviderTable.id, providerId))
					.then(takeUniqueOrUndefinded);
				if (!provider) {
					set.status = 404;
					return {
						success: false,
						message: "Fiat provider not found",
						data: null,
					};
				}

				return {
					success: true,
					data: provider,
					message: "Fiat provider fetched successfully",
				};
			} catch (error) {
				set.status = 500;
				const err = ensureError(error);
				log.error("Error fetching fiat provider: {error}", { error });
				return {
					success: false,
					message: err.message,
					data: null,
				};
			}
		});
