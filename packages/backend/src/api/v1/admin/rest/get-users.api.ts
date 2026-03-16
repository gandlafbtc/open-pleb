import Elysia, { t } from "elysia";
import * as business from "../../../../business/admin/get-users.business";
import { ensureError } from "common/errors";
import { log } from "../../../../util/logger";

export const getUsers = (app: Elysia) =>
    app.get(
        "/users",
        async ({ query }) => {
            try {
                const { limit, beforeCreatedAt } = query;
                return await business.getUsers(
                    limit ? Number(limit) : 100,
                    beforeCreatedAt ? Number(beforeCreatedAt) : undefined
                );
            } catch (error) {
                const err = ensureError(error);
                log.error("Error {error}", { error });
                return new Response(err.message, {
                    status: 500,
                });
            }

        },
        {
            query: t.Object({
                limit: t.Optional(t.String()),
                beforeCreatedAt: t.Optional(t.String()),
            }),
        }
    );
