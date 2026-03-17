import Elysia, { t } from "elysia";
import * as biz from "../../../../../business/app/user.business";
import { ensureError } from "common/errors";
import { log } from "../../../../../util/logger";
export const registerUser = (app: Elysia) =>
    app.post("register", async ({ body }) => {
        const { pubkey, inviteCode } = body;

        try {
            const ok = await biz.registerUser(pubkey, inviteCode)
            return {
                ok
            }
        } catch (error) {
            const err = ensureError(error);
            log.error("Error registering user: {error}", { error });
            return new Response(err.message, {
                status: 401,
            });
        }
    }, {
        body: t.Object({
            pubkey: t.String(),
            inviteCode: t.String()
        })
    })