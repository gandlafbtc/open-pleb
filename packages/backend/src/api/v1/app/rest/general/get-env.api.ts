import { ensureError } from "common/errors";
import { environment } from "../../../../../env";
import { log } from "../../../../../util/logger";
import Elysia from "elysia";

export const getEnv = (app: Elysia) => 
    app.get("envsettings", ()=> {
        try {
            return {
                env: environment,
            };
        } catch (error) {
        const err = ensureError(error);
        log.error("Error getting env settings: {error}", { error });
        return new Response(err.message, {
            status: 500,
        });
    }
    })