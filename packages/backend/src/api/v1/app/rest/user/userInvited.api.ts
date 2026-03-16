import * as biz from "../../../../../business/app/user.business";
import { ensureError } from "common/errors";
import { log } from "../../../../../util/logger";
import Elysia from "elysia";
export const isUserInvited = (app: Elysia) => 
    app.get(":pubkey", async ({ params: { pubkey } }) => {

        try {
            return {
                isInvited: await biz.isUserInvited(pubkey)
            }
        } catch (error) {
            const err = ensureError(error);
            log.error("Error loading user: {error}", { error });
            return new Response(err.message, {
                status: 500,
            });
        }
    })
