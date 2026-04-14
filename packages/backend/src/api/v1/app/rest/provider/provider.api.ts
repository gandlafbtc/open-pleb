import { ensureError } from "common/errors";
import { log } from "../../../../../util/logger";
import { providerRepository } from "../../../../../repository/app/provider.repository";
import Elysia from "elysia";

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