import { ensureError } from "common/errors";
import { getConversionRate as getConversion } from "../../../../../util/conversion";
import { log } from "../../../../../util/logger";
import Elysia from "elysia";

export const getConversionRate = async (app: Elysia) => 
    
    app.get("/conversion", async () => {
        try {
            const conversion = await getConversion();
            return { conversion };
        } catch (error) {
            const err = ensureError(error);
            log.error("Error getting conversion rate: {error}", { error });
            return new Response(err.message, {
                status: 500,
            });
        }
    })