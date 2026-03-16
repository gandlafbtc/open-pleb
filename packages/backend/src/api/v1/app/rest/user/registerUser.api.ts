import Elysia from "elysia";
import * as biz from "../../../../../business/app/user.business";
import { ensureError } from "common/errors";
import { log } from "../../../../../util/logger";
export const registerUser = (app: Elysia) => 
    app.post("register", async ({body})=> {
				const { pubkey, inviteCode } = body;
        
                try {
                    return {
                        isInvited: await biz.registerUser(pubkey, inviteCode)
                    }
                } catch (error) {
                    const err = ensureError(error);
                    log.error("Error loading user: {error}", { error });
                    return new Response(err.message, {
                        status: 500,
                    });
                }
    })